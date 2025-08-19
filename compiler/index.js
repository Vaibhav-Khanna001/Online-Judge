const express = require('express');
const { v4: uuid } = require('uuid');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// Import the separate execution functions
const { executeCpp } = require('./executeCpp');
const { executePy } = require('./executePy');
const { executeJava } = require('./executeJava');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setup directory for code files
const dirCodes = path.join(__dirname, 'codes');
if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}

const generateFile = (language, code) => {
    const jobId = uuid();
    const filename = `${jobId}.${language}`;
    const filepath = path.join(dirCodes, filename);
    fs.writeFileSync(filepath, code);
    return filepath;
};

app.post('/run', async (req, res) => {
    const { language = 'cpp', code, input } = req.body;

    if (code === undefined || code.trim() === "") {
        return res.status(400).json({ success: false, error: "Empty code body!" });
    }

    const filepath = generateFile(language, code);

    try {
        let output;
        // --- UPDATE: Pass the raw input string directly to the execution functions ---
        switch (language) {
            case 'cpp':
                output = await executeCpp(filepath, input);
                break;
            case 'py':
                output = await executePy(filepath, input);
                break;
            case 'java':
                output = await executeJava(filepath, input);
                break;
            default:
                return res.status(400).json({ success: false, error: "Unsupported language" });
        }
        res.json({ output });
    } catch (err) {
        // The 'err' from spawn-based promises is often the stderr string directly
        res.status(500).json({ error: err.stderr || err });
    } finally {
        // Clean up the generated code file
        fs.unlink(filepath, () => {});
    }
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Compiler microservice running on port ${PORT}`);
});

