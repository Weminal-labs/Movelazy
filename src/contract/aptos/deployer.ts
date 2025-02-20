import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
const execAsync = promisify(exec);

export class AptosDeployerService {

    async getAccountAddress(webview: vscode.Webview) {
        const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!workspacePath) {
            console.error('Workspace path is undefined.');
            return null;
        }
        let accountAddress: string | null = null;

        const configFilePath = path.join(workspacePath, '.aptos', 'config.yaml'); // Path to the config file

        if (fs.existsSync(configFilePath)) {
            try {
                const fileContents = fs.readFileSync(configFilePath, 'utf8');
                const config: any = yaml.load(fileContents);

                if (config && config.profiles && config.profiles.default && config.profiles.default.account) {
                    accountAddress = config.profiles.default.account;

                    return accountAddress;
                } else {
                    console.error('Account not found in config file.');
                }
            } catch (error) {
                console.error('Error parsing config file:', error);
            }
        } else {
            console.error(`Config file ${configFilePath} does not exist.`);
        }
        return Promise.reject('Failed to read account from config');
    }
    async requestFaucet(webview: vscode.Webview) {
        const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!workspacePath) {
            console.log("No workspace folder found.");
            webview.postMessage({
                type: 'deployStatus',
                success: false,
                message: 'No workspace folder found.'
            });
            return;
        }

        await execAsync(`aptos account fund-with-faucet`, { cwd: workspacePath });
        const { stdout, stderr } = await execAsync(`aptos account balance`, { cwd: workspacePath });
        if (stderr) {
            console.error('Error getting account balance:', stderr);
            return null;
        }
        const result = JSON.parse(stdout);
        const balance = result.Result[0].balance;
        return balance;
    } catch(error: any) {
        console.error('Error executing command:', error);
        return null;
    }

    async getBalance(webview: vscode.Webview) {
        const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        try {
            const { stdout, stderr } = await execAsync(`aptos account balance`, { cwd: workspacePath });
            if (stderr) {
                console.error('Error getting account balance:', stderr);
                return null;
            }
            console.log('Balance command output:', stdout);
            const result = JSON.parse(stdout);
            const balance = result.Result[0].balance;
            console.log('Parsed balance:', balance);
            return balance;
        } catch (error) {
            console.error('Error executing balance command:', error);
            return null;
        }
    }
    async deploy(webview: vscode.Webview, namedAddresses: string) {
        const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!workspacePath) {
            console.log("No workspace folder found.");
            webview.postMessage({
                type: 'deployStatus',
                success: false,
                message: 'No workspace folder found.'
            });
            return;
        }

        console.log("Named Addresses:", namedAddresses);

        if (!namedAddresses) {
            console.log("Named addresses are missing.");
            webview.postMessage({
                type: 'deployStatus',
                success: false,
                message: 'Named addresses are missing.'
            });
            return;
        }

        let accountAddress: string | null = null;
        async function readAccountFromConfig(): Promise<void> {
            if (!workspacePath) {
                console.error('Workspace path is undefined.');
                return;
            }

            const configFilePath = path.join(workspacePath, '.aptos', 'config.yaml'); // Path to the config file

            if (fs.existsSync(configFilePath)) {
                try {
                    const fileContents = fs.readFileSync(configFilePath, 'utf8');
                    const config: any = yaml.load(fileContents);

                    if (config && config.profiles && config.profiles.default && config.profiles.default.account) {
                        accountAddress = config.profiles.default.account;
                        console.log('Account Address from config:', accountAddress);

                        return; // Resolve when account is found and assigned
                    } else {
                        console.error('Account not found in config file.');
                    }
                } catch (error) {
                    console.error('Error parsing config file:', error);
                }
            } else {
                console.error(`Config file ${configFilePath} does not exist.`);
            }
            return Promise.reject('Failed to read account from config');
        }


        await readAccountFromConfig();


        try {
            // Kiểm tra xem Aptos CLI đã được cài đặt chưa
            console.log("Checking if Aptos CLI is installed...");
            await execAsync('aptos --version', { cwd: workspacePath });
            console.log("check>>>>>>>", "   ", namedAddresses);

            // Triển khai module Move từ thư mục đúng
            const command = `aptos move publish --named-addresses ${namedAddresses}=default --gas-unit-price 1000 --max-gas 3000 --bytecode-version 6 --compiler-version 1`;
            console.log("Command to execute:", command);

            const publishProcess = spawn(command, { cwd: workspacePath, shell: true });

            let stdoutData = '';
            let stderrData = '';

            publishProcess.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
                stdoutData += data.toString();
                if (data.toString().includes('Do you want to submit a transaction')) {
                    console.log("Submitting transaction...");
                    publishProcess.stdin.write('yes\n');
                }
            });

            publishProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
                stderrData += data.toString();
                webview.postMessage({
                    type: 'deployStatus',
                    success: false,
                    message: data.toString()
                });
            });

            publishProcess.on('close', (code) => {
                console.log(`Process exited with code ${code}`);
                webview.postMessage({
                    type: 'deployStatus',
                    success: code === 0,
                    message: code === 0 ? 'Deployment successful!' : `Process exited with code ${code}`,
                    stdout: stdoutData,
                    stderr: stderrData
                });
            });

        } catch (error) {
            console.error("Error during deployment:", (error as Error).message);
            webview.postMessage({
                type: 'deployStatus',
                success: false,
                message: (error as Error).message
            });
        }
    }

}