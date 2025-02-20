import { exec } from 'child_process';

function CheckAptos(): Boolean {
    // Command to check if Aptos is installed
    const comm = "aptos --version";

    // Execute the command, Return 1 if Aptos existed, 0 if not
    let isAptosInstalled = false;
    exec(comm, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            isAptosInstalled = false;
        }

        if (stderr) {
            console.error(`stderr: ${stderr}`);
            isAptosInstalled = false;
        }

        isAptosInstalled = true;
    });

    return isAptosInstalled;
}

export { CheckAptos }