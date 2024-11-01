import * as vscode from 'vscode';
import { MovelazyViewProvider } from './MovelazyViewProvider';
import { HardhatService } from './services/hardhat';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "movelazy" is now active!');

	const provider = new MovelazyViewProvider(context);
	const hardhat = new HardhatService();

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(MovelazyViewProvider.viewType, provider)
	);

	/* context.subscriptions.push(
		vscode.commands.registerCommand('movelazy.openWebview', () => {
			// Tạo một WebviewPanel
			const panel = vscode.window.createWebviewPanel(
				'Movelazy',
				'Movelazy',
				vscode.ViewColumn.One,
				{
					enableScripts: true, // Cho phép script nếu cần
				}
			);

			// Xử lý messages từ webview
			panel.webview.onDidReceiveMessage(
				async message => {
					switch (message.command) {
						case 'compile':
							const result = await hardhat.compile(message.contractPath);
							panel.webview.postMessage({ command: 'compiled', data: result });
							break;
						// Xử lý các commands khác
					}
				}
			);
		})
	); */
}

export function deactivate() { }