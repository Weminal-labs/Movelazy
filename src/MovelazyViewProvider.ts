import * as vscode from 'vscode';
import * as path from 'path';
import { WorkspaceService } from './services/workspace';
import { CompilerService } from './services/compiler';

export class MovelazyViewProvider implements vscode.WebviewViewProvider {

    public static readonly viewType = 'MovelazyView';
    private workspaceService: WorkspaceService;
    private compilerService: CompilerService;

    constructor(private readonly _context: vscode.ExtensionContext) {
        this.workspaceService = new WorkspaceService();
        this.compilerService = new CompilerService();
    }

    public resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this._context.extensionUri, 'webview', 'build')
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async message => {
            try {
                switch (message.command) {
                    case 'updateConfig':
                        await this.workspaceService.updateHardhatConfig(message.settings);
                        break;
                    case 'compile':
                        await this.compilerService.compile(webviewView.webview);
                        break;
                }
            } catch (error) {
                webviewView.webview.postMessage({
                    type: 'compileStatus',
                    success: false,
                    message: (error as Error).message
                });
            }
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._context.extensionUri, 'webview', 'build', 'assets', 'index.js')
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._context.extensionUri, 'webview', 'build', 'assets', 'style.css')
        );

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; script-src ${webview.cspSource} 'unsafe-inline'; style-src ${webview.cspSource} 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com;">
                <title>MoveLazy</title>
                <link href="${styleUri}" rel="stylesheet">
                <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet">
            </head>
            <body>
                <div id="root"></div>
                <script type="module" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}
