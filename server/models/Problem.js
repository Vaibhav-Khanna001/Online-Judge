const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // Removes whitespace
  },
  statement: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard'], // Only allows these values
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Problem = mongoose.model('problem', ProblemSchema);
module.exports = Problem;
