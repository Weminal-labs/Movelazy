import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class CompilerService {
    async compile(webview: vscode.Webview) {
        try {
            // Kiểm tra xem hardhat đã được cài đặt chưa
            try {
                await execAsync('npx hardhat --version', {
                    cwd: vscode.workspace.workspaceFolders?.[0].uri.fsPath
                });
            } catch {
                webview.postMessage({
                    type: 'compileStatus',
                    success: false,
                    message: 'Hardhat is not installed. Please run: npm install --save-dev hardhat'
                });
                return;
            }

            const { stdout, stderr } = await execAsync('npx hardhat compile', {
                cwd: vscode.workspace.workspaceFolders?.[0].uri.fsPath
            });

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
} 