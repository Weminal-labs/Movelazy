import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class AptosTesterService {
    async compile(webview: vscode.Webview, packageDir: string, namedAddresses: string, moveVersion: string, optimizer: boolean, optimizerlevel: string, bytecodeHash: string) {
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
            let command = `aptos move compile --package-dir ${packageDir} --named-addresses ${namedAddresses} `;

            if (moveVersion === 'Move 2') {
                command += `--move-2`;
            } else {
                command += `${optimizer === true ? `--optimize ${optimizerlevel}` : ''} --bytecode-version ${bytecodeHash} `;
            }
            const { stdout, stderr } = await execAsync(command, { cwd: workspacePath });


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
                message: stderr + stdout || 'Compilation and publishing successful!'
            });

        } catch (error) {
            webview.postMessage({
                type: 'compileStatus',
                success: false,
                message: (error as Error).message
            });
        }
    }

    async tester(webview: vscode.Webview, enabled: boolean, testName: string, moveVersion: string, optimizer: boolean, optimizerlevel: string, bytecodeHash: string) {
        const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!workspacePath) {
            webview.postMessage({
                type: 'testerStatus',
                success: false,
                message: 'No workspace folder found.'
            });
            return;
        }

        try {
            // Check if Aptos CLI is installed
            await execAsync('aptos --version', { cwd: workspacePath });
            let command = `aptos move test ${enabled ? `-f ${testName}` : ''} `;

            if (moveVersion === 'Move 2') {
                command += `--move-2`;
            } else {
                command += `${optimizer === true ? `--optimize ${optimizerlevel}` : ''} --bytecode-version ${bytecodeHash} `;
            }
            const { stdout, stderr } = await execAsync(command, { cwd: workspacePath });

            const isInformational = stdout.includes('"Success"');

            if (stderr && !isInformational) {
                webview.postMessage({
                    type: 'testerStatus',
                    success: false,
                    message: stderr
                });
                return;
            }

            webview.postMessage({
                type: 'testerStatus',
                success: true,
                message: stderr + stdout || 'Compilation and publishing successful!'
            });

        } catch (error) {
            webview.postMessage({
                type: 'testerStatus',
                success: false,
                message: (error as Error).message
            });
        }
    }
}