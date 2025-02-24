import { exec, spawn } from 'child_process';
import * as vscode from 'vscode';
import { promisify } from 'util';
import { TestArgs } from '../contract/aptos/types';

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

async function AptosInit(webview: vscode.Webview, network: string = "devnet", endpoint: string, faucetEndpoint: string, privateKey: string) {
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
                    type: "cliStatus",
                    success: true,
                    message: outputData,
                });
            } else {
                webview.postMessage({
                    type: "cliStatus",
                    success: false,
                    message: `Aptos initialization failed with exit code ${code}`,
                });
            }
        });
    }

    function notCustom(network: string, privateKey: string) {
    console.log("Initializing Aptos CLI...");

    const aptosProcess = spawn("aptos", ["init"], {
        cwd: workspacePath,
        stdio: ["pipe", "pipe", "pipe"],
    });

    let outputData = "";

    aptosProcess.stderr.on("data", (data) => {
        const output = data.toString();
        console.log("CLI Output:", output);

        if (output.includes("already initialized")) {
            console.log("Aptos already initialized, confirming overwrite...");
            aptosProcess.stdin.write("yes\n");
        } else if (output.includes("Choose network")) {
            console.log(`Selecting network: ${network}`);
            aptosProcess.stdin.write(`${network}\n`);
        } else if (output.includes("Enter your private key as a hex literal")) {
            console.log("Entering private key...");
            aptosProcess.stdin.write(`${privateKey || ""}\n`);
        } else if (output.match(/Account\s0x[a-fA-F0-9]+/)) {
            outputData += output;
        }
    });

    aptosProcess.on("close", (code) => {
        if (code === 0) {
            webview.postMessage({
                type: "cliStatus",
                success: true,
                message: outputData.trim(),
            });
        } else {
            webview.postMessage({
                type: "cliStatus",
                success: false,
                message: `Aptos initialization failed with exit code ${code}`,
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

async function AptosInfo(webview: vscode.Webview) {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspacePath) {
        throw new Error("Workspace path not found");
    }

    try {
        const { stdout, stderr } = await execAsync("aptos info", { cwd: workspacePath });
        webview.postMessage({
            type: "cliStatus",
            success: true,
            message: stderr + stdout,
        });
    } catch (error) {
        webview.postMessage({
            type: "cliStatus",
            success: false,
            message: (error as Error).message,
        });
    }
}

async function AptosMoveInit(webview: vscode.Webview, name: string, packageDir: string, namedAddresses: string, template: string, assumeYes: boolean, assumeNo: boolean, frameworkGitRev: string, frameworkLocalDir: string, skipFetchLatestGitDeps: boolean) {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspacePath) {
        throw new Error("Workspace path not found");
    }

    let command = "aptos move init";
    if (name) {
        command += " --name " + name;
    }
    if (packageDir !== "") {
        command += " --package-dir " + packageDir;
    }
    if (namedAddresses !== "") {
        command += " --named-addresses " + namedAddresses;
    }
    if (template !== "") {
        command += " --template " + template;
    }
    if (assumeYes) {
        command += " --assume-yes";
    }
    if (assumeNo) {
        command += " --assume-no";
    }
    if (frameworkGitRev !== "") {
        command += " --framework-git-rev " + frameworkGitRev;
    }
    if (frameworkLocalDir !== "") {
        command += " --framework-local-dir " + frameworkLocalDir;
    }
    if (skipFetchLatestGitDeps) {
        command += " --skip-fetch-latest-git-deps";
    }

    try {
        const { stdout, stderr } = await execAsync(command, { cwd: workspacePath });
        webview.postMessage({
            type: "cliStatus",
            success: true,
            message: stderr + stdout,
        });
    } catch (error) {
        webview.postMessage({
            type: "cliStatus",
            success: false,
            message: (error as Error).message,
        });

    }
}

async function MoveTest(webview: vscode.Webview, args: TestArgs) {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspacePath) {
        throw new Error("Workspace path not found");
    }

    let command = "aptos move test";
    if (args.namedAddresses !== "") {
        command += " --named-addresses " + args.namedAddresses + "=default";;
    }
    if (args.filter !== "") {
        command += " --filter " + args.filter;
    }
    if (args.ignoreCompileWarnings) {
        command += " --ignore-compile-warnings";
    }
    if (args.packageDir !== "") {
        command += " --package-dir " + args.packageDir;
    }
    if (args.outputDir !== "") {
        command += " --output-dir " + args.outputDir;
    }
    if (args.overrideStd !== "") {
        command += " --override-std " + args.overrideStd;
    }
    if (args.skipFetchLatestGitDeps) {
        command += " --skip-fetch-latest-git-deps";
    }
    if (args.skipAttributeChecks) {
        command += " --skip-attribute-checks";
    }
    if (args.dev) {
        command += " --dev";
    }
    if (args.checkTestCode) {
        command += " --check-test-code";
    }
    if (args.optimize !== "") {
        command += " --optimize " + args.optimize;
    }
    if (args.bytecodeVersion !== "") {
        command += " --bytecode-version " + args.bytecodeVersion;
    }
    if (args.compilerVersion !== "") {
        command += " --compiler-version " + args.compilerVersion;
    }
    if (args.languageVersion !== "") {
        command += " --language-version " + args.languageVersion;
    }
    if (args.moveVersion !== "") {
        command += " --move-version " + args.moveVersion;
    }
    if (args.instructions !== "") {
        command += " --instructions " + args.instructions;
    }
    if (args.coverage) {
        command += " --coverage";
    }
    if (args.dump) {
        command += " --dump";
    }

    try {
        const { stdout, stderr } = await execAsync(command, { cwd: workspacePath });
        webview.postMessage({
            type: "cliStatus",
            success: true,
            message: stderr + stdout,
        });

    }
    catch (error) {
        webview.postMessage({
            type: "cliStatus",
            success: false,
            message: (error as Error).message,
        });
    }
}

export { CheckAptos, CheckAptosInit, AptosInit, AptosMoveInit, AptosInfo, MoveTest };