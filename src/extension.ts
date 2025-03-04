import * as vscode from 'vscode';
import { ViewProvider } from './ViewProvider';
import path from 'path';
import fs from 'fs';
import { spawnSync, exec } from 'child_process';
import os from 'os';

export function activate(context: vscode.ExtensionContext) {
	let lastHoveredMoveLazyPosition: vscode.Position | null = null;

	console.log('Congratulations, your extension "movelazy" is now active!');

	const provider = new ViewProvider(context);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(ViewProvider.viewType, provider));

	const hoverDecorationType = vscode.window.createTextEditorDecorationType({
		textDecoration: "underline",
		backgroundColor: "rgba(255, 255, 0, 0.3)",
	});

	const hoverProvider = vscode.languages.registerHoverProvider("markdown", {
		provideHover(document, position) {
			const range = document.getWordRangeAtPosition(position);
			if (!range) return;
			const word = document.getText(range);
			if (word === "move_lazy") {
				lastHoveredMoveLazyPosition = position;
				const editor = vscode.window.activeTextEditor;
				if (editor) {
					editor.setDecorations(hoverDecorationType, [range]);
					setTimeout(() => editor.setDecorations(hoverDecorationType, []), 3000);
				}
				const markdownHover = new vscode.MarkdownString();
				markdownHover.appendMarkdown(`### 🚀 Movelazy\n`);
				markdownHover.appendMarkdown(`🔹 Click to run the code in the block.\n\n`);
				markdownHover.appendMarkdown(`✅ Click **[Here](command:extension.runMoveLazy)** to execute.`);
				return new vscode.Hover(markdownHover, range);
			}
		},
	});

	const linkProvider = vscode.languages.registerDocumentLinkProvider("markdown", {
		provideDocumentLinks(document) {
			const text = document.getText();
			const links: vscode.DocumentLink[] = [];
			const regex = /move_lazy/g;
			let match;
			while ((match = regex.exec(text)) !== null) {
				const startPos = document.positionAt(match.index);
				const endPos = document.positionAt(match.index + match[0].length);
				links.push(new vscode.DocumentLink(new vscode.Range(startPos, endPos), vscode.Uri.parse("command:extension.runMoveLazy")));
			}
			return links;
		},
	});

	function insertOutputIntoMarkdown(document: vscode.TextDocument, insertPosition: vscode.Position, outputText: string) {
		const edit = new vscode.WorkspaceEdit();
		edit.insert(document.uri, insertPosition, `\n\`\`\`output\n${outputText.trim()}\n\`\`\`\n`);
		vscode.workspace.applyEdit(edit);
	}

	function checkRustInstalled(): boolean {
		return !spawnSync("rustc", ["--version"], { encoding: "utf-8" }).error;
	}

	async function deleteTempFile(filePath: string) {
		try {
			if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
		} catch (err) {
			console.error(`❌ Error deleting file: ${filePath}`, err);
		}
	}

	const runMoveLazyCommand = vscode.commands.registerCommand("extension.runMoveLazy", async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage("❌ No active editor.");
			return;
		}
		if (!checkRustInstalled()) {
			vscode.window.showErrorMessage("❌ Rust not installed.");
			return;
		}
		const document = editor.document;
		const text = document.getText();
		const wordIndex = lastHoveredMoveLazyPosition ? document.offsetAt(lastHoveredMoveLazyPosition) : null;
		if (wordIndex === null) {
			vscode.window.showErrorMessage("❌ Could not find `move_lazy`.");
			return;
		}
		const codeBlockRegex = /```rust\s*\n([\s\S]*?)```/g;
		let match, targetCodeBlock = null, endOfCodeBlockPosition = null;
		while ((match = codeBlockRegex.exec(text)) !== null) {
			if (document.offsetAt(document.positionAt(match.index)) > wordIndex) {
				targetCodeBlock = match[1].trim();
				endOfCodeBlockPosition = document.positionAt(match.index + match[0].length);
				break;
			}
		}
		if (!targetCodeBlock || !endOfCodeBlockPosition) {
			vscode.window.showErrorMessage("❌ No Rust code block found.");
			return;
		}
		const tempFilePath = path.join(__dirname, "temp_lazy_code.rs");
		const outputFilePath = path.join(__dirname, os.platform() === "win32" ? "temp_lazy_exec.exe" : "temp_lazy_exec");
		fs.writeFileSync(tempFilePath, targetCodeBlock);
		exec(`rustc "${tempFilePath}" -o "${outputFilePath}" && ${os.platform() === "win32" ? outputFilePath : `"./${outputFilePath}"`}`,
			async (error, stdout, stderr) => {
				if (error) {
					vscode.window.showErrorMessage(`❌ Compilation error: ${stderr}`);
				} else {
					insertOutputIntoMarkdown(document, endOfCodeBlockPosition, stdout);
					vscode.window.showInformationMessage("✅ Execution successful!");
				}
				await deleteTempFile(tempFilePath);
				await deleteTempFile(outputFilePath);
			}
		);
	});

	context.subscriptions.push(hoverProvider, linkProvider, runMoveLazyCommand);
}

export function deactivate() {
	console.log('Your extension "movelazy" is now deactivated!');
}
