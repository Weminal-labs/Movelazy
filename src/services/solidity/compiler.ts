import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class CompilerService {
    async compile(webview: vscode.Webview) {
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
            // Check if Hardhat is installed
            await execAsync('npx hardhat --version', { cwd: workspacePath });

            // Compile contracts
            const { stdout, stderr } = await execAsync('npx hardhat compile', { cwd: workspacePath });

            if (stderr && !stderr.includes('Compiled')) {
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
                message: stdout || 'Compilation successful!'
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
            // Run hardhat clean
            const { stdout, stderr } = await execAsync('npx hardhat clean', { cwd: workspacePath });

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