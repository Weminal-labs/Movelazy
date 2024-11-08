import * as vscode from 'vscode';
import { MovelazyViewProvider } from './MovelazyViewProvider';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "movelazy" is now active!');

	const provider = new MovelazyViewProvider(context);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(MovelazyViewProvider.viewType, provider)
	);
}

export function deactivate() { }