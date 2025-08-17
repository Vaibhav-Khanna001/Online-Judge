const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
// --- FIX: Correctly import both auth and admin middleware from the same file ---
const { auth, admin } = require('../middleware/auth'); 

const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');

// @route   GET api/problems
// @desc    Get all problems
// @access  Public
router.get('/', async (req, res) => {
    try {
        const problems = await Problem.find().sort({ name: 1 });
        res.json(problems);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/problems/:id
// @desc    Get a single problem by ID with its sample test cases
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ msg: 'Problem not found' });
        }
        // --- FIX: Changed 'problemId' to 'problem' to match your likely schema ---
        const testCases = await TestCase.find({ problem: req.params.id, isSample: true });
        res.json({ problem, testCases });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   POST api/problems
// @desc    Create a new problem
// @access  Private/Admin
router.post(
    '/',
    [
        auth,
        admin, // Protect this route for admins only
        [
            check('name', 'Name is required').not().isEmpty(),
            check('statement', 'Statement is required').not().isEmpty(),
            check('difficulty', 'Difficulty is required').isIn(['Easy', 'Medium', 'Hard']),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, statement, difficulty, solutionCode } = req.body;

        try {
            const newProblem = new Problem({
                name,
                statement,
                difficulty,
                solutionCode // This will be saved from the form
            });

            const problem = await newProblem.save();
            res.json(problem);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);


// --- NEW ROUTE FOR UPDATING A PROBLEM ---
// @route   PUT api/problems/:id
// @desc    Update an existing problem
// @access  Private/Admin
router.put(
    '/:id',
    [
        auth,
        admin,
        [
            check('name', 'Name is required').not().isEmpty(),
            check('statement', 'Statement is required').not().isEmpty(),
            check('difficulty', 'Difficulty is required').isIn(['Easy', 'Medium', 'Hard']),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, statement, difficulty, solutionCode } = req.body;

        // Build problem object
        const problemFields = {};
        if (name) problemFields.name = name;
        if (statement) problemFields.statement = statement;
        if (difficulty) problemFields.difficulty = difficulty;
        if (solutionCode) problemFields.solutionCode = solutionCode;

        try {
            let problem = await Problem.findById(req.params.id);

            if (!problem) return res.status(404).json({ msg: 'Problem not found' });

            problem = await Problem.findByIdAndUpdate(
                req.params.id,
                { $set: problemFields },
                { new: true } // Return the updated document
            );

            res.json(problem);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);


// @route   DELETE api/problems/:id
// @desc    Delete a problem
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ msg: 'Problem not found' });
        }
        
        // --- FIX: Also changed 'problemId' to 'problem' here for consistency ---
        await TestCase.deleteMany({ problem: req.params.id });

        await Problem.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Problem and associated test cases removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;