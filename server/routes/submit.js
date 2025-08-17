const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth'); 
const axios = require('axios');
const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');

// The URL for your separate compiler microservice.
const COMPILER_SERVICE_URL = 'http://localhost:5001/run'; // Make sure this is correct

// @route   POST api/submit
// @desc    Submit user's code for judging against all test cases
// @access  Private
router.post(
    '/', 
    [
        auth,
        [
            check('language', 'Language is required').not().isEmpty(),
            check('code', 'Code is required').not().isEmpty(),
            check('problemId', 'Problem ID is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { language, code, problemId } = req.body;

        try {
            // 1. Fetch ALL test cases for the problem (including hidden ones)
            const allTestCases = await TestCase.find({ problem: problemId });

            if (allTestCases.length === 0) {
                return res.status(400).json({ msg: 'No test cases found for this problem.' });
            }

            // 2. Loop through each test case and judge the code
            for (const tc of allTestCases) {
                try {
                    // Call the compiler microservice with the user's code and the current test case's input
                    const response = await axios.post(COMPILER_SERVICE_URL, {
                        language,
                        code,
                        input: tc.input || ''
                    });

                    const userOutput = response.data.output.trim();
                    const expectedOutput = tc.expectedOutput.trim();

                    // 3. Compare the output
                    if (userOutput !== expectedOutput) {
                        // If any test case fails, immediately return a "Failed" verdict
                        return res.json({ 
                            verdict: 'Failed', 
                            message: `Wrong Answer on test case #${allTestCases.indexOf(tc) + 1}` 
                        });
                    }
                } catch (compilerError) {
                    // If the code fails to compile or has a runtime error
                    const errorMsg = compilerError.response ? (compilerError.response.data.error || 'Error from compiler service') : 'Error communicating with compiler service';
                    return res.json({ 
                        verdict: 'Error', 
                        message: `Error on test case #${allTestCases.indexOf(tc) + 1}: ${errorMsg}` 
                    });
                }
            }

            // 4. If all test cases pass, return a "Successful" verdict
            res.json({ verdict: 'Successful', message: 'All test cases passed!' });

        } catch (err) {
            console.error('Submission Error:', err.message);
            res.status(500).send('Server Error');
        }
    }
);

module.exports = router;
