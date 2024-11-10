import * as vscode from 'vscode';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';

const execAsync = promisify(exec);

export class AptosCompilerService {
    async compile(webview: vscode.Webview, packageDir: string, namedAddresses: string, moveVersion: string, optimizer: boolean, optimizerlevel: string, bytecodeHash: string, network: string) {
        const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!workspacePath) {
            webview.postMessage({
                type: 'compileStatus',
                success: false,
                message: 'No workspace folder found.'
            });
            return;
        }

        try {
            // Check if Aptos CLI is installed
            await execAsync('aptos --version', { cwd: workspacePath });

            const input = 'https://fund.testnet.porto.movementlabs.xyz/\n';


            async function runAptos() {
                if (!workspacePath) {
                    throw new Error('Workspace path is undefined.');
                }

                const aptosDirPath = path.join(workspacePath, '.aptos');
                const shouldOverwrite = fs.existsSync(aptosDirPath);

                const aptosPromise = new Promise<void>((resolve, reject) => {
                    const aptosProcess = spawn('aptos', ['init', '--network', 'custom', '--rest-url', `${network}`], {
                        cwd: workspacePath,
                        stdio: ['pipe', 'pipe', 'pipe']
                    });

                    aptosProcess.on('close', (code) => {
                        if (code === 0) {
                            resolve();
                        } else {
                            reject(new Error(`Aptos process failed with exit code ${code}`)); // Added error message
                        }
                    });

                    if (shouldOverwrite) {
                        aptosProcess.stdin.write("yes\n");
                    }
                    if (input) {
                        aptosProcess.stdin.write(input); // Ensure input is valid
                    } else {
                        reject(new Error('Input is required but not provided.'));
                        return;
                    }

                    aptosProcess.stdin.end(); // End the stdin stream properly
                });

                await aptosPromise; // Wait for aptos process to finish
                console.log('Aptos process completed successfully.');
            }



            runAptos()
                .then(async () => {
                    try {
                        console.log('Now you can run the next command.');
                        // Continue with the next task
                        let command = `aptos move compile --package-dir ${packageDir} --named-addresses ${namedAddresses}=default `;

                        if (moveVersion === 'Move 2') {
                            command += `--move-2`;
                        } else {
                            command += `${optimizer === true ? `--optimize ${optimizerlevel}` : ''}--bytecode-version ${bytecodeHash} `;
                        }
                        const { stdout, stderr } = await execAsync(command, { cwd: workspacePath });
                        const isInformational = stdout.includes('"Result"');

                        if (stderr && !isInformational) {
                            console.log("check error", "sadasfasf", stderr)
                            webview.postMessage({
                                type: 'compileStatus',
                                success: false,
                                message: stderr
                            });
                            return;
                        }

                        webview.postMessage({
                            type: 'compileStatus',
                            success: true,
                            message: stderr + stdout || 'Compilation successful!'
                        });
                    } catch (error) {
                        console.error('An error occurred while reading the config:', error);
                        webview.postMessage({
                            type: 'compileStatus',
                            success: false,
                            message: (error as Error).message
                        });
                    }

                })
                .catch((error) => {
                    console.error('An error occurred:', error);
                    webview.postMessage({
                        type: 'compileStatus',
                        success: false,
                        message: (error as Error).message
                    });
                });

        } catch (error) {
            webview.postMessage({
                type: 'compileStatus',
                success: false,
                message: (error as Error).message
            });
        }
    }

    async clean(webview: vscode.Webview) {
        const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!workspacePath) {
            webview.postMessage({
                type: 'cleanStatus',
                success: false,
                message: 'No workspace folder found.'
            });
            return;
        }

        try {
            const { stdout, stderr } = await execAsync('npm aptos clean', { cwd: workspacePath });

            if (stderr) {
                webview.postMessage({
                    type: 'cleanStatus',
                    success: false,
                    message: stderr
                });
                return;
            }

            webview.postMessage({
                type: 'cleanStatus',
                success: true,
                message: stdout || 'Cleaned successfully!'
            });

        } catch (error) {
            webview.postMessage({
                type: 'cleanStatus',
                success: false,
                message: (error as Error).message
            });
        }
    }
}