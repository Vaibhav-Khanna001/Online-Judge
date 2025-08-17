const { spawn } = require("child_process");

const executePy = (filepath, input) => {
    return new Promise((resolve, reject) => {
        // Use spawn to run the python script
        const childProcess = spawn("python", [filepath]);

        let output = '';
        let errorOutput = '';

        // Send the provided input to the python script's standard input
        childProcess.stdin.write(input || '');
        childProcess.stdin.end();

        // Listen for the script's output
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
                // If successful, resolve with the script's output
                resolve(output);
            }
        });

        // Handle errors in spawning the process itself
        childProcess.on('error', (err) => {
            reject(err);
        });
    });
};

module.exports = { executePy };