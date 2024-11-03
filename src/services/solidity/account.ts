import * as vscode from 'vscode';
import { ChildProcess, spawn } from 'child_process';
import { WorkspaceService } from './workspace';

interface HardhatAccount {
    address: string;
    balance: string;
    privateKey: string;
}

export class AccountService {
    private hardhatNode: ChildProcess | null = null;

    constructor(private context: vscode.ExtensionContext) {}

    async startLocalNode(webview: vscode.Webview) {
        const workspacePath = new WorkspaceService(this.context).getWorkspacePath();
        console.log('Starting local node at:', workspacePath);
        
        try {
            if (this.hardhatNode) {
                console.log('Hardhat node already running');
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

            let buffer = '';
            this.hardhatNode.stdout?.on('data', (data: Buffer) => {
                buffer += data.toString();
                console.log('Hardhat node output:', buffer);
                
                if (buffer.includes('Account #') && buffer.includes('Private Key')) {
                    const lines = buffer.split('\n');
                    const accounts: HardhatAccount[] = [];
                    
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].includes('Account #')) {
                            const addressLine = lines[i];
                            const privateLine = lines[i + 1];
                            
                            if (addressLine && privateLine) {
                                const [addressPart, balancePart] = addressLine.split('(');
                                const address = addressPart.split(':')[1]?.trim() || '';
                                const balance = balancePart?.split(')')[0]?.trim() || '';
                                const privateKey = privateLine.split(':')[1]?.trim() || '';
                                
                                if (address && balance && privateKey) {
                                    accounts.push({ address, balance, privateKey });
                                }
                            }
                        }
                    }

                    if (accounts.length > 0) {
                        console.log('Parsed accounts:', accounts);
                        webview.postMessage({
                            type: 'accounts',
                            accounts
                        });
                        buffer = ''; // Clear buffer after processing
                    }
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
