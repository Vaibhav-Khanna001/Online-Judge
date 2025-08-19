const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth'); 
const axios = require('axios');
const Problem = require('../models/Problem');

const COMPILER_SERVICE_URL = 'http://compiler:5001/run'; 

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
            const response = await axios.post(COMPILER_SERVICE_URL, {
                language,
                code,
                input: input || ''
            });
            res.json({ output: response.data.output });
        } catch (err) {
            console.error('Compiler Service Error:', err.response ? err.response.data : err.message);
            const status = err.response ? err.response.status : 500;
            // --- FIX: Properly extract the error message from the compiler's response ---
            const errorMsg = err.response && err.response.data && err.response.data.error 
                ? err.response.data.error 
                : 'Error communicating with compiler service';
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
            check('language', 'Language is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { problemId, input, language } = req.body;

        try {
            const problem = await Problem.findById(problemId);
            if (!problem) {
                return res.status(404).json({ msg: 'Problem not found' });
            }

            const solutionCode = problem.solutionCode[language];

            if (!solutionCode) {
                return res.status(400).json({ msg: `Solution code for ${language} is not available for this problem.` });
            }

            const response = await axios.post(COMPILER_SERVICE_URL, {
                language,
                code: solutionCode,
                input
            });
            res.json({ output: response.data.output });

        } catch (err) {
            console.error('Compiler Service Error:', err.response ? err.response.data : err.message);
            const status = err.response ? err.response.status : 500;
            // --- FIX: Properly extract the error message from the compiler's response ---
            const errorMsg = err.response && err.response.data && err.response.data.error 
                ? err.response.data.error 
                : 'Error communicating with compiler service';
            res.status(status).json({ error: errorMsg });
        }
    }
);

module.exports = router;
