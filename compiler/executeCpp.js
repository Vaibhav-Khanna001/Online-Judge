const { exec, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filepath, input) => {
    const jobId = path.basename(filepath).split(".")[0];
    const outPath = path.join(outputPath, `${jobId}.exe`);

    return new Promise((resolve, reject) => {
        // First, compile the C++ file using g++
        exec(`g++ "${filepath}" -o "${outPath}"`, (error, stdout, stderr) => {
            if (error) {
                // If there's a compilation error, reject the promise
                return reject({ error, stderr });
            }
            if (stderr) {
                // If there are compilation warnings, log them but continue
                console.log("Compilation warnings:", stderr);
            }

            // If compilation is successful, run the executable
            const childProcess = spawn(`"${outPath}"`, { shell: true });
            
            let output = '';
            let errorOutput = '';

            // Send the provided input to the C++ program's standard input
            childProcess.stdin.write(input || '');
            childProcess.stdin.end();

            // Listen for the program's output
            childProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            // Listen for any errors during execution
            childProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            // Handle the process exit event
            childProcess.on('close', (code) => {
                if (code !== 0) {
                    // If the process exits with an error code, reject
                    reject(errorOutput || `Process exited with code ${code}`);
                } else {
                    // If successful, resolve with the program's output
                    console.log(output);
                    resolve(output);
                }
            });

            // Handle errors in spawning the process itself
            childProcess.on('error', (err) => {
                reject(err);
            });
        });
    });
};

module.exports = { executeCpp };