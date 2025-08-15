const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');
const { auth, admin } = require('../middleware/auth');

// @route   POST api/problems
// @desc    Create a problem
// @access  Private (Admin only)
router.post('/', [auth, admin], async (req, res) => {
  const { name, statement, difficulty } = req.body;
  try {
    const newProblem = new Problem({ name, statement, difficulty });
    const problem = await newProblem.save();
    res.json(problem);
  } catch (err)
 {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/problems
// @desc    Get all problems
// @access  Public
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/problems/:id
// @desc    Get a single problem and its sample test cases
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ msg: 'Problem not found' });
        }

        const testCases = await TestCase.find({ problem: req.params.id, isSample: true });

        res.json({ problem, testCases });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Problem not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/problems/:id
// @desc    Update a problem
// @access  Private (Admin only)
router.put('/:id', [auth, admin], async (req, res) => {
    const { name, statement, difficulty } = req.body;
    try {
        let problem = await Problem.findById(req.params.id);
        if (!problem) return res.status(404).json({ msg: 'Problem not found' });

        problem.name = name;
        problem.statement = statement;
        problem.difficulty = difficulty;

        await problem.save();
        res.json(problem);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/problems/:id
// @desc    Delete a problem
// @access  Private (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ msg: 'Problem not found' });
        }
        await problem.deleteOne();
        res.json({ msg: 'Problem removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;