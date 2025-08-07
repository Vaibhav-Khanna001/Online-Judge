const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth'); // Import the auth routes

// Load environment variables from .env file
dotenv.config();

// Initialize the Express app
const app = express();

// --- Connect to Database ---
const connectDB = async () => {
  try {
    // Make sure to have your MONGO_URI in the .env file
    // The options useNewUrlParser and useUnifiedTopology are no longer needed
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

connectDB();

// --- Middlewares ---
// This allows your frontend (on a different URL) to talk to your backend
app.use(cors());
// This allows your server to understand JSON data sent from the frontend
app.use(express.json());

// --- Routes ---
// A simple test route to make sure the server is alive
app.get('/', (req, res) => {
  res.send('Hello from the Online Judge Backend!');
});

// Use the authentication routes for any request to '/api/auth'
app.use('/api/auth', authRoutes);

// --- Start the Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});