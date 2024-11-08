
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

            const input = 'skip\n\n';

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
                            reject();
                        }
                    });

                    if (shouldOverwrite) {
                        aptosProcess.stdin.write("yes\n");
                    }
                    aptosProcess.stdin.write(input);
                    aptosProcess.stdin.end();
                });

                await aptosPromise;
                console.log('Aptos process completed successfully.');
            }

            runAptos()
                .then(() => {
                    console.log('Now you can run the next command.');
                })
                .catch((error) => {
                    console.error('An error occurred:', error);
                });


            let accountAddress: string | null = null;
            function readAccountFromConfig() {
                if (!workspacePath) {
                    console.error('Workspace path is undefined.');
                    return;
                }
                const configFilePath = path.join(workspacePath, '.aptos', 'config.yaml'); // Đường dẫn đến file config.yaml

                if (fs.existsSync(configFilePath)) {
                    try {
                        const fileContents = fs.readFileSync(configFilePath, 'utf8');
                        const config: any = yaml.load(fileContents);

                        if (config && config.profiles && config.profiles.default && config.profiles.default.account) {
                            accountAddress = config.profiles.default.account;
                            console.log('Account Address from config:', accountAddress);
                        } else {
                            console.error('Account not found in config file.');
                        }
                    } catch (error) {
                        console.error('Error parsing config file:', error);
                    }
                } else {
                    console.error(`Config file ${configFilePath} does not exist.`);
                }
            }

            readAccountFromConfig();

            let command = `aptos move compile --package-dir ${packageDir} --named-addresses ${namedAddresses}=${accountAddress} `;

            if (moveVersion === 'Move 2') {
                command += `--move-2`;
            } else {
                command += `${optimizer === true ? `--optimize ${optimizerlevel}` : ''} --bytecode-version ${bytecodeHash} `;
            }
            const { stdout, stderr } = await execAsync(command, { cwd: workspacePath });

            console.log("check>>> KQ", stdout, " checkeck", stderr);

            const isInformational = stdout.includes('"Result"');

            if (stderr && !isInformational) {
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