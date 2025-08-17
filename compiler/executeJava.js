const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

const executeJava = (filepath, input) => {
    const jobId = path.basename(filepath).split(".")[0];
    const classPath = path.join(outputPath, jobId);

    return new Promise((resolve, reject) => {
        // First, compile the Java file
        exec(`javac -d "${outputPath}" "${filepath}"`, (error, stdout, stderr) => {
            if (error) {
                return reject({ error, stderr });
            }
            if (stderr) {
                console.log(`Compilation warnings for ${jobId}:`, stderr);
            }

            // If compilation is successful, run the compiled .class file
            const javaProcess = exec(`java -cp "${outputPath}" Main`, (runError, runStdout, runStderr) => {
                if (runError) {
                    return reject({ error: runError, stderr: runStderr });
                }
                if (runStderr) {
                   return reject(runStderr);
                }
                resolve(runStdout);
            });

            // Provide input to the running Java program
            javaProcess.stdin.write(input || '');
            javaProcess.stdin.end();
        });
    });
};

module.exports = { executeJava };