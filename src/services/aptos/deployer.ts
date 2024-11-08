import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import { spawn } from 'child_process';

const execAsync = promisify(exec);

export class AptosDeployerService {
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

        try {
            // Kiểm tra xem Aptos CLI đã được cài đặt chưa
            console.log("Checking if Aptos CLI is installed...");
            await execAsync('aptos --version', { cwd: workspacePath });
            console.log("check>>>>>>>", "   ", namedAddresses);

            // Triển khai module Move từ thư mục đúng
            const command = `aptos move publish --named-addresses ${namedAddresses}`;
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