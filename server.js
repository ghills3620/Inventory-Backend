const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Add this line to import the 'cors' module
const bodyParser = require('body-parser');
const { Schema } = mongoose;


const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const mongoURI = "mongodb+srv://ghills3620:SuperCoder@cluster0.mbiiuvo.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;

connection.once('open', () => {
    console.log('MongoDB database connection established successfully');
});

// User Schema
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    password: String // In a production environment, you should encrypt this field
});

const itemSchema = new Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User'
    },
    itemName: String,
    description: String,
    quantity: Number
});

// User Model
const User = mongoose.model('User', userSchema);

// Item Model
const Item = mongoose.model('Item', itemSchema);

// Create Read Update Delete (CRUD) Routes

// Create Routes

// User Sign In
app.post('/api/signin', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the user with the provided username exists
        const user = await User.findOne({ username });

        if (!user) {
            // User not found
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        //TODO:
        // Assuming your passwords are stored securely (e.g., hashed)
        // You would typically use a library like bcrypt to compare hashed passwords
        // For demonstration purposes, this uses a simple equality check
        if (user.password === password) {
            // Successful sign-in
            return res.status(200).json({ message: 'Sign-in successful' });
        } else {
            // Incorrect password
            return res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create a new user sign up
app.post('/api/signup', async (req, res) => {
    try {
        const { firstname, lastname, username, password } = req.body;

        // Check if the username already exists in the database
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            // Username already exists
            return res.status(400).json({ error: 'Username already exists. Please choose a different username or sign in.' });
        }

        // If the username is unique, proceed with user registration
        const newUser = new User({
            firstName: firstname,
            lastName: lastname,
            username,
            password,
        });

        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all items
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find().populate('UserId');
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Create a new item
app.post('/api/items', async (req, res) => {
    try {
        console.log('Request body:', req.body);  // Log the request body

        const newItem = new Item(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Bad Request', message: error.message });
    }
});

// Read Routes

// Get a specific user by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Retrieve all items
app.get('/api/items', async (req, res) => {
    try {
        // Retrieve all items from the database
        const items = await Item.find().populate('UserId');

        // If no items are found, return an empty array
        if (!items || items.length === 0) {
            return res.json([]);
        }

        // If items are found, send them as a JSON response
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//Update Routes

// Update an item by ID
app.put('/api/items/:id', async (req, res) => {
    try {
        const itemId = req.params.id;
        const updatedData = req.body;

        // Check if the item with the provided ID exists
        const existingItem = await Item.findById(itemId);

        if (!existingItem) {
            // Item not found
            return res.status(404).json({ error: 'Item not found' });
        }

        // Update the item with the new data
        Object.assign(existingItem, updatedData);

        // Save the updated item to the database
        await existingItem.save();

        res.status(200).json(existingItem);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Test input
// curl -X PUT -H "Content-Type: application/json" -d
// '{"itemName": "new", "description": "new update", "quantity": 5}'
// http://localhost:5001/api/items/65b728d73368933df7d41618

//Delete Routes

// Delete an item by ID
app.delete('/api/items/:id', async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id);
        res.status(200).send('Item deleted successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// ... Add routes for other CRUD operations on users and items

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
