import * as vscode from 'vscode';
import { ViewProvider } from './ViewProvider';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "movelazy" is now active!');

	const provider = new ViewProvider(context);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ViewProvider.viewType, provider)
	);
}

export function deactivate() { }