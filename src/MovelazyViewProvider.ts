import * as vscode from 'vscode';
import * as path from 'path';
import { WorkspaceService } from './services/workspace';

export class MovelazyViewProvider implements vscode.WebviewViewProvider {

    public static readonly viewType = 'MovelazyView';
    private workspaceService: WorkspaceService;

    constructor(private readonly _context: vscode.ExtensionContext) {
        this.workspaceService = new WorkspaceService();
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
            switch (message.command) {
                case 'updateConfig':
                    await this.workspaceService.updateHardhatConfig(message.settings);
                    break;
            }
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._context.extensionUri, 'webview', 'build', 'assets', 'index.js')
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._context.extensionUri, 'webview', 'build', 'assets', 'index.css')
        );
        const logoUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._context.extensionUri, 'webview', 'build', 'assets', 'logo.svg')
        );

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; script-src ${webview.cspSource}; style-src ${webview.cspSource};">
                <title>MoveLazy</title>
                <link href="${styleUri}" rel="stylesheet">
            </head>
            <body>
                <img src="${logoUri}" alt="MoveLazy Logo" />
                <div id="root"></div>
                <script src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}
