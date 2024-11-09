import * as vscode from 'vscode';
import * as path from 'path';
import { SolidityService } from './services/solidity';
import { AptosService } from './services/aptos';
import { WorkspaceService } from './services/solidity/workspace';
import { DeployerService } from './services/solidity/deployer';
import { AptosTesterService } from './services/aptos/tester';


export class MovelazyViewProvider implements vscode.WebviewViewProvider {

    public static readonly viewType = 'MovelazyView';
    private readonly solidityService: SolidityService;
    private readonly aptosService: AptosService;
    private workspace: WorkspaceService;
    private deployerService: DeployerService;
    constructor(
        private readonly context: vscode.ExtensionContext
    ) {
        this.workspace = new WorkspaceService(context);
        this.solidityService = new SolidityService(context);
        this.aptosService = new AptosService(context);
        this.deployerService = new DeployerService();
    }

    public resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'webview', 'build')
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (message) => {
            try {
                switch (message.command) {
                    case 'solidity.compile':
                        await this.solidityService.updateCompilerConfig(message.settings);
                        await this.solidityService.compile(webviewView.webview);
                        break;
                    case 'solidity.deploy':
                        console.log('handling deploy');
                        try {
                            const result = await this.deployerService.deploy(message.settings);
                            webviewView.webview.postMessage({
                                type: 'deploySuccess',
                                result: result
                            });
                        } catch (error) {
                            webviewView.webview.postMessage({
                                type: 'error',
                                message: (error as Error).message
                            });
                        }
                        break;
                    case 'solidity.getSettings':
                        const settings = this.solidityService.getSettings();
                        webviewView.webview.postMessage({
                            type: 'settings',
                            settings
                        });
                        break;
                    case 'solidity.initWorkspace':
                        webviewView.webview.postMessage({
                            type: 'workspaceStatus',
                            loading: true
                        });
                        try {
                            await this.solidityService.initWorkspace();
                            webviewView.webview.postMessage({
                                type: 'workspaceStatus',
                                initialized: true,
                                loading: false
                            });
                        } catch (error) {
                            webviewView.webview.postMessage({
                                type: 'workspaceStatus',
                                error: (error as Error).message,
                                loading: false
                            });
                        }
                        break;
                    case 'solidity.checkWorkspace':
                        const isHardhatWorkspace = await this.solidityService.checkWorkspace();
                        webviewView.webview.postMessage({
                            type: 'workspaceStatus',
                            initialized: isHardhatWorkspace,
                            loading: false
                        });
                        break;
                    case 'solidity.clean':
                        await this.solidityService.clean(webviewView.webview);
                        break;
                    case 'solidity.startLocalNode':
                        await this.solidityService.startLocalNode(webviewView.webview);
                        break;
                    case 'solidity.stopLocalNode':
                        await this.solidityService.stopLocalNode();
                        break;
                    case 'solidity.getCompiledContracts':
                        try {
                            const contracts = await this.workspace.getCompiledContracts();
                            webviewView.webview.postMessage({
                                type: 'compiledContracts',
                                contracts: contracts
                            });
                        } catch (error) {
                            webviewView.webview.postMessage({
                                type: 'error',
                                message: (error as Error).message
                            });
                        }
                        break;
                    case 'aptos.compile':
                        await this.aptosService.updateConfig(message.settings);
                        await this.aptosService.compile(webviewView.webview);
                        break;
                    case 'aptos.updateConfig':
                        await this.aptosService.updateConfig(message.settings);
                        break;
                    case 'aptos.getSettings':
                        const aptosSettings = this.aptosService.getSettings();
                        webviewView.webview.postMessage({
                            type: 'settings',
                            settings: aptosSettings
                        });
                        break;
                    case 'aptos.initWorkspace':
                        webviewView.webview.postMessage({
                            type: 'workspaceStatus',
                            loading: true
                        });
                        try {
                            await this.aptosService.initWorkspace();
                            webviewView.webview.postMessage({
                                type: 'workspaceStatus',
                                initialized: true,
                                loading: false
                            });
                        } catch (error) {
                            webviewView.webview.postMessage({
                                type: 'workspaceStatus',
                                error: (error as Error).message,
                                loading: false
                            });
                        }
                        break;
                    case 'aptos.checkWorkspace':
                        const isAptos = await this.aptosService.checkWorkspace();
                        webviewView.webview.postMessage({
                            type: 'workspaceStatus',
                            initialized: isAptos,
                            loading: false
                        });
                        break;
                    case 'aptos.clean':
                        await this.aptosService.clean(webviewView.webview);
                        break;
                    case 'aptos.tester':
                        await this.aptosService.test(webviewView.webview, message.flags.enabled, message.flags.testName);
                        break;
                    case 'aptos.deploy':
                        await this.aptosService.deploy(webviewView.webview);
                        break;
                    case 'aptos.accountAddress':
                        const accountAddress = await this.aptosService.getAccountAddress(webviewView.webview);
                        webviewView.webview.postMessage({
                            type: 'accountAddress',
                            address: accountAddress
                        });
                        break;
                    case 'aptos.requestFaucet':
                        const balance = await this.aptosService.requestFaucet(webviewView.webview);
                        webviewView.webview.postMessage({
                            type: 'balance',
                            balance: balance
                        });
                        break;

                }
            } catch (error) {
                webviewView.webview.postMessage({
                    type: 'error',
                    message: (error as Error).message
                });
            }
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'webview', 'build', 'assets', 'index.js')
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'webview', 'build', 'assets', 'style.css')
        );

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; script-src ${webview.cspSource} 'unsafe-inline'; style-src ${webview.cspSource} 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src ${webview.cspSource} https://fullnode.devnet.aptoslabs.com;">
                <title>MoveLazy</title>
                <link href="${styleUri}" rel="stylesheet">
                <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet">
            </head>
            <body>
                <div id="root"></div>
                <script>
                    (function() {
                        try {
                            const vscode = acquireVsCodeApi();
                            window.vscode = vscode;
                            console.log('VSCode API initialized successfully');
                        } catch (error) {
                            console.error('Failed to initialize VSCode API:', error);
                        }
                    })();
                </script>
                <script type="module" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}
