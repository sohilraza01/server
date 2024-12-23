const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./model/User'); 
const Donation  = require('./model/Donation');
const bcrypt = require('bcryptjs');

const PORT = 8800;
const db_URI = 'mongodb+srv://sohilraza:sohilraza@cluster0.yglab.mongodb.net/food_donation_db?retryWrites=true&w=majority&appName=Cluster0';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Signup Route with bcrypt
app.post('/signup', async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword, // Save hashed password
            role,
        });

        // Save to the database
        await newUser.save();
        res.status(201).json({
            message: 'User registered successfully',
            user: { ...newUser.toObject(), password: undefined }, // Exclude password from response
        });

    } catch (error) {
        res.status(400).json({
            message: 'Error registering user',
            error: error.message,
        });
    }
});

// Login Route with bcrypt
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        // Validate password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid email or password',
            });
        }

        // Successful login response
        res.status(200).json({
            message: 'Login successful',
            role: user.role,
            user: { ...user.toObject(), password: undefined }, // Exclude password from response
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message,
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

//   post the data in the pending component
// app.get('/donations/pending', async (req, res) => {
//     try {
//       const newDonation = new Donation({
//         donorName: req.body.donorName,
//         foodType: req.body.foodType,
//         quantity: req.body.quantity,
//         status: "Pending", // Default to Pending
//         date: new Date().toLocaleDateString(),
//       });
//       const savedDonation = await newDonation.save();
//       res.status(201).json(savedDonation);
//     } catch (error) {
//       res.status(500).json({ message: "Error adding donation", error: error.message });
//     }
//   });
  
  
  
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
  

  app.get("/dashboard", async (req, res) => {
    try {
      // Count donors with valid login IDs
      const donorCount = await Donation.distinct("donorName", { donorId: { $exists: true, $ne: null } }).length;
  
      // Count NGOs with valid login IDs
      const ngoCount = await Donation.distinct("ngoName", { ngoId: { $exists: true, $ne: null } }).length;
  
      // Count donations with "Pending" status
      const notCompletedCount = await Donation.countDocuments({ status: "Pending" });
  
      // Count donations with "Completed" status
      const completedCount = await Donation.countDocuments({ status: "Completed" });
  
      // Send the counts to the frontend
      res.json({
        adminCount: donorCount,
        ngoCount,
        notCompletedCount, // The count of pending donations
        completedCount,
      });
  
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });


//   Put the data into completed 

app.put('/donations/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedDonation = await Donation.findByIdAndUpdate(
            id,
            { status: "Completed" },
            { new: true }
        );

        if (!updatedDonation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        res.status(200).json(updatedDonation);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
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
