const mongoose = require('mongoose');



const DonationSchema = new mongoose.Schema({
    donorName: { 
        type: String, 
        required: true 
    },
    foodType: { 
        type: String, 
        required: true 
    },
    quantity: { 
        type: String, 
        required: true 
    },
    status: 
    { 
        type: String,
        enum: ["Pending", "Completed"],
        default: "Pending", 
    },
    
    date: { 
        type: String, 
        required: true 
    },
  });

  module.exports = mongoose.model('Donation',DonationSchema);
