const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./model/User'); 
const Donation  = require('./model/Donation');

const PORT = 8800;
const db_URI = 'mongodb+srv://sohilraza:sohilraza@cluster0.yglab.mongodb.net/food_donation_db?retryWrites=true&w=majority&appName=Cluster0';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Signup Route
app.post('/signup', async (req, res) => {
    const { username, email, password, role} = req.body;

    try {
        // Create a new user
        const newUser = new User({
            username,
            email,
            password,
            role
        });

        // Save to the database
        await newUser.save();
        res.status(201).json({
            message: 'User registered successfully',
            user: newUser
        });
        console.log(res);

    } catch (error) {
        res.status(400).json({
            message: 'Error registering user',
            error: error.message
        });
    }
});


// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Validate password
        if (user.password !== password) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Successful login response
        res.status(200).json({
            message: 'Login successful',
            role:user.role,
            user
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});


// Add Donation Route
// Assuming you've set up your express and mongoose connection
app.post('/donations', async (req, res) => {
    try {
      const donations = req.body;  // Array of donations
      const savedDonations = await Donation.insertMany(donations);  // Insert multiple donations at once
      res.status(201).json(savedDonations);
    } catch (error) {
      res.status(500).json({ message: "Error saving donations", error: error.message });
    }
  });
  
  
  // Fetch Donations Route (optional for history)
  app.get('/donations', async (req, res) => {
    try {
      const donations = await Donation.find();
      res.status(200).json(donations);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching donations', error: error.message });
    }
  });


// Fetch Donations Route
app.get('/donations', async (req, res) => {
    try {
      const donations = await Donation.find().sort({ date: -1 }); // Sort by latest date
      res.status(200).json(donations);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching donations', error: error.message });
    }
  });
  

//   Delete Donation history route
app.delete('/donations/:id', async (req,res) => {
    const {id} = req.params;
    try{
        await Donation.findByIdAndDelete(id);
        const updateDonations = await Donation.find();
        res.status(200).json(updateDonations);
    } catch(error) {
        res.status(400).json({message: 'Error to Delete Data',error:error.message});
    }
})




// Connect to MongoDB and Start Server
mongoose.connect(db_URI)
.then(() => {
    console.log('Database is Connected');
    app.listen(PORT, () => {
        console.log(`Server started at port no ${PORT}`);
    });
})
.catch((err) => {
    console.error('Database Connection Error:', err.message);
    exit(1);
});
