const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
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
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/problems
// @desc    Get all problems
// @access  Public
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find().sort({ date: -1 });
    res.json(problems);
  } catch (err) {
    console.error(err.message);
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

        // --- THIS IS THE FIX ---
        // Use deleteOne() instead of the deprecated remove()
        await problem.deleteOne();

        res.json({ msg: 'Problem removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;