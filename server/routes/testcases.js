const express = require('express');
const router = express.Router();
const TestCase = require('../models/TestCase');
const Problem = require('../models/Problem'); // This line is crucial
const { auth, admin } = require('../middleware/auth');

// @route   POST api/testcases
// @desc    Create a test case for a problem
// @access  Private (Admin only)
router.post('/', [auth, admin], async (req, res) => {
  const { problemId, input, expectedOutput, isSample } = req.body;
  try {
    // This check requires the 'Problem' model to be imported
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }
    const newTestCase = new TestCase({ problem: problemId, input, expectedOutput, isSample });
    const testCase = await newTestCase.save();
    res.json(testCase);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/testcases/:problemId
// @desc    Get all test cases for a specific problem
// @access  Private (Admin only)
router.get('/:problemId', [auth, admin], async (req, res) => {
    try {
        const testCases = await TestCase.find({ problem: req.params.problemId });
        res.json(testCases);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/testcases/:id
// @desc    Delete a test case by its own ID
// @access  Private (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const testCase = await TestCase.findById(req.params.id);
        if (!testCase) {
            return res.status(404).json({ msg: 'Test case not found' });
        }
        await testCase.deleteOne();
        res.json({ msg: 'Test case removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;