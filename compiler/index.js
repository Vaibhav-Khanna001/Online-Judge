const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');
const { executeCpp } = require('./executeCpp');
const { executePy } = require('./executePy');
const { executeJava } = require('./executeJava');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const dirCodes = path.join(__dirname, 'codes');
if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}
app.get('/', (req, res) => {
    res.send("hello world");
});
app.post('/run', async (req, res) => {
    const { language, code, input } = req.body;
   console.log("code",code);
    // --- ENHANCED DEBUGGING ---
    // This will show us the exact data being received.
    console.log("Full request body received:", req.body);
    console.log("Language parameter received:", `"${language}"`);


    if (code === undefined || code.trim() === '') {
        return res.status(400).json({ success: false, error: "Empty code body!" });
    }

    const jobId = uuid();
    const filepath = path.join(dirCodes, `${jobId}.${language}`);
    
    try {
        fs.writeFileSync(filepath, code);

        let output;
        
        if (language === 'cpp') {
            output = await executeCpp(filepath, input);
        } else if (language === 'py') {
            output = await executePy(filepath, input);
        } else if (language === 'java') {
            output = await executeJava(filepath, input);
        } else {
            // This is the block that is currently being triggered
            return res.status(400).json({ success: false, error: "Unsupported language!" });
        }

        return res.json({ success: true, output });

    } catch (error) {
        const errorDetails = error.stderr || error;
        return res.status(500).json({ success: false, error: errorDetails });
    } finally {
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
        if (language === 'cpp') {
            const exePath = path.join(__dirname, 'outputs', `${jobId}.exe`);
            if (fs.existsSync(exePath)) {
                fs.unlinkSync(exePath);
            }
        } else if (language === 'java') {
            const classPath = path.join(__dirname, 'outputs', 'Main.class');
             if (fs.existsSync(classPath)) {
                fs.unlinkSync(classPath);
            }
        }
    }
});

const PORT = 5001; 
app.listen(PORT, () => {
    console.log(`Compiler microservice running on port ${PORT}`);
});
