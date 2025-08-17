const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth'); 
const axios = require('axios'); // Use axios to make HTTP requests
const Problem = require('../models/Problem');

// The URL for your separate compiler microservice.
// Make sure this is running and accessible from your main backend.
const COMPILER_SERVICE_URL = 'http://localhost:5001/run'; // Assuming port 5001 for the microservice

// @route   POST api/run
// @desc    Send user-submitted code to the compiler microservice
// @access  Private
router.post(
    '/', 
    [
        auth,
        [
            check('language', 'Language is required').not().isEmpty(),
            check('code', 'Code is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { language, code, input } = req.body;

        try {
            // Instead of executing code locally, we now call the compiler microservice.
            const response = await axios.post(COMPILER_SERVICE_URL, {
                language,
                code,
                input: input || ''
            });
            // Forward the output from the microservice to the client.
            res.json({ output: response.data.output });
        } catch (err) {
            // Handle errors from the microservice (e.g., compilation errors, network issues).
            console.error('Compiler Service Error:', err.response ? err.response.data : err.message);
            const status = err.response ? err.response.status : 500;
            const errorMsg = err.response ? (err.response.data.error || 'Error from compiler service') : 'Error communicating with compiler service';
            res.status(status).json({ error: errorMsg });
        }
    }
);

// @route   POST api/run/solution
// @desc    Send solution code to the compiler microservice
// @access  Private
router.post(
    '/solution', 
    [
        auth,
        [
            check('problemId', 'Problem ID is required').not().isEmpty(),
            check('input', 'Input is required').exists(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { problemId, input } = req.body;

        try {
            const problem = await Problem.findById(problemId);
            if (!problem) {
                return res.status(404).json({ msg: 'Problem not found' });
            }

            // Defaulting to C++ solution. This can be expanded later.
            const solutionCode = problem.solutionCode.cpp;
            const language = 'cpp';

            if (!solutionCode) {
                return res.status(400).json({ msg: 'Solution code for this problem is not available.' });
            }

            // Call the same compiler microservice with the solution code.
            const response = await axios.post(COMPILER_SERVICE_URL, {
                language,
                code: solutionCode,
                input
            });
            res.json({ output: response.data.output });

        } catch (err) {
            console.error('Compiler Service Error:', err.response ? err.response.data : err.message);
            const status = err.response ? err.response.status : 500;
            const errorMsg = err.response ? (err.response.data.error || 'Error from compiler service') : 'Error communicating with compiler service';
            res.status(status).json({ error: errorMsg });
        }
    }
);

module.exports = router;
