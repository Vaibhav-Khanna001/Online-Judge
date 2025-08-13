const mongoose = require('mongoose');

// This is the blueprint for a "User" in our database
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Every email must be unique
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'user', 
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Create the model from the schema and export it
const User = mongoose.model('user', UserSchema);
module.exports = User;
