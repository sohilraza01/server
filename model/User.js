const mongoose = require('mongoose');

// Define user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role:{
        type:String,
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});








// Export the model
module.exports = mongoose.model('User', userSchema);
