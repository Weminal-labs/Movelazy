import { exec, spawn } from 'child_process';
import * as vscode from 'vscode';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function CheckAptos(): Promise<Boolean> {
    try {
        // Run command "aptos --version"
        const { stdout } = await execAsync("aptos --version");

        // If has output, Aptos has been installed
        if (stdout.trim().length > 0) { return true; }

        // Other case, Aptos has not been installed
        return false;
    } catch (error) {
        return false;
    }
}

async function CheckAptosInit(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        // Get workspace path
        const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!workspacePath) {
            resolve(false);
            return;
        }

        const aptosProcess = spawn("aptos", ["init"], {
            cwd: workspacePath,  // Set current working directory
            stdio: ["pipe", "pipe", "pipe"],  // Connect stdin, stdout, stderr
        });

        // Listen output (stdout) from process
        aptosProcess.stdout.on("data", (data) => {
            const output = data.toString();

            // Check notify "Aptos already initialized for profile default"
            if (output.includes("Aptos already initialized for profile default")) {
                aptosProcess.kill(); // terminate process
                resolve(true); // Return true
            }

            // If have other input request, return false
            if (output.includes("Please choose a network")) {
                aptosProcess.kill(); // terminate process
                resolve(false); // Return false
            }
        });

        // Listen error (stderr)
        aptosProcess.stderr.on("data", (data) => {
            console.error("Error:", data.toString());
            aptosProcess.kill(); // Terminate process when error
            resolve(false); // Return false when error
        });

        // Listen when process end
        aptosProcess.on("close", (code) => {
            if (code !== 0) {
                console.error(`Aptos process failed with exit code ${code}`);
                resolve(false); // Return false when process failed
            }
        });
    });
}

async function AptosInit(webview: vscode.Webview, network: string, endpoint: string, faucetEndpoint: string, privateKey: string) {
    // Get workspace path
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspacePath) {
        throw new Error("Workspace path not found");
    }

    function custom(network: string, endpoint: string, faucetEndpoint: string, privateKey: string) {
        const aptosProcess = spawn("aptos", ["init"], {
            cwd: workspacePath,
            stdio: ["pipe", "pipe", "pipe"],
        });

        let outputData = "";
        aptosProcess.stderr.on("data", (data) => {
            const output = data.toString();

            if (output.includes("Choose network")) {
                aptosProcess.stdin.write(`${network}\n`);
            }

            if (output.includes("Enter your rest endpoint")) {
                aptosProcess.stdin.write(`${endpoint || ""}\n`);
            }

            if (output.includes("Enter your faucet endpoint")) {
                aptosProcess.stdin.write(`${faucetEndpoint || ""}\n`);
            }

            if (output.includes("Enter your private key as a hex literal")) {
                aptosProcess.stdin.write(`${privateKey || ""}\n`);
            }

            if (output.includes("account") || output.includes("Account")) {
                outputData += output;
            }
        });

        aptosProcess.on("close", (code) => {
            if (code === 0) {
                webview.postMessage({
                    type: "initStatus",
                    success: true,
                    initInfo: outputData,
                });
            } else {
                webview.postMessage({
                    type: "initStatus",
                    success: false,
                    initInfo: `Aptos initialization failed with exit code ${code}`,
                });
            }
        });
    }

    function notCustom(network: string, privateKey: string) {
        const aptosProcess = spawn("aptos", ["init"], {
            cwd: workspacePath,
            stdio: ["pipe", "pipe", "pipe"],
        });

        let outputData = "";
        aptosProcess.stderr.on("data", (data) => {
            const output = data.toString();

            if (output.includes("Choose network")) {
                aptosProcess.stdin.write(`${network}\n`);
            }

            if (output.includes("Enter your private key as a hex literal")) {
                aptosProcess.stdin.write(`${privateKey || ""}\n`);
            }

            if (output.includes("account") || output.includes("Account")) {
                outputData += output;
            }
        });


        aptosProcess.on("close", (code) => {
            if (code === 0) {
                webview.postMessage({
                    type: "initStatus",
                    success: true,
                    initInfo: outputData,
                });
            } else {
                webview.postMessage({
                    type: "initStatus",
                    success: false,
                    initInfo: `Aptos initialization failed with exit code ${code}`,
                });
            }
        });
    }

    if (network === 'custom') {
        custom(network, endpoint, faucetEndpoint, privateKey);
    }
    else {
        notCustom(network, privateKey);
    }
}

async function AptosMoveInit(webview: vscode.Webview, name: string, packageDir: string, namedAddresses: string, template: string, assumeYes: boolean, assumeNo: boolean, frameworkGitRev: string, frameworkLocalDir: string, skipFetchLatestGitDeps: boolean) {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspacePath) {
        throw new Error("Workspace path not found");
    }

    const command = ["move", "init"];

}

export { CheckAptos, CheckAptosInit, AptosInit, AptosMoveInit };