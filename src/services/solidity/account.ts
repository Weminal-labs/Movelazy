import * as vscode from 'vscode';
import { ChildProcess, spawn } from 'child_process';
import { WorkspaceService } from './workspace';

interface HardhatAccount {
    address: string;
    balance: string;
}

export class AccountService {
    private hardhatNode: ChildProcess | null = null;

    constructor(private context: vscode.ExtensionContext) {}

    async startLocalNode(webview: vscode.Webview) {
        const workspacePath = new WorkspaceService(this.context).getWorkspacePath();
        
        try {
            if (this.hardhatNode) {
                webview.postMessage({
                    type: 'error',
                    message: 'Hardhat node is already running'
                });
                return;
            }

            this.hardhatNode = spawn('npx', ['hardhat', 'node'], { 
                cwd: workspacePath,
                shell: true 
            });

            this.hardhatNode.stdout?.on('data', (data: Buffer) => {
                const output = data.toString();
                if (output.includes('Account #')) {
                    const accounts: HardhatAccount[] = output.split('\n')
                        .filter((line: string) => line.includes('Account #'))
                        .map((line: string) => {
                            const [addressPart, balancePart] = line.split('(');
                            const address = addressPart.split(':')[1].trim();
                            const balance = balancePart.split(')')[0].trim();
                            return { address, balance };
                        });

                    webview.postMessage({
                        type: 'accounts',
                        accounts
                    });
                }
            });

            this.hardhatNode.stderr?.on('data', (data: Buffer) => {
                webview.postMessage({
                    type: 'error',
                    message: data.toString()
                });
            });

        } catch (error) {
            webview.postMessage({
                type: 'error',
                message: (error as Error).message
            });
        }
    }

    async stopLocalNode() {
        if (this.hardhatNode) {
            this.hardhatNode.kill();
            this.hardhatNode = null;
        }
    }
}
