const mongoose = require('mongoose');

const TestCaseSchema = new mongoose.Schema({
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'problem', // This links it to the Problem model
    required: true,
  },
  input: {
    type: String,
    required: true,
  },
  expectedOutput: {
    type: String,
    required: true,
  },
  isSample: { // To distinguish between default and hidden test cases
    type: Boolean,
    default: false,
  },
});

const TestCase = mongoose.model('testCase', TestCaseSchema);
module.exports = TestCase;
