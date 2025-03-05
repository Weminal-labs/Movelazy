import * as vscode from 'vscode';
import { ViewProvider } from './ViewProvider';
import path from 'path';
import fs from 'fs';
import { spawnSync, exec } from 'child_process';
import os from 'os';
import axios from "axios";

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
			if (!range) { return; }
			const word = document.getText(range);

			// console.log(word);
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
			if (word === "output") {
				const markdownHover = new vscode.MarkdownString();
				markdownHover.appendMarkdown(`🗑 **Click to delete this output**`);
				markdownHover.isTrusted = true;
				return new vscode.Hover(markdownHover, range);
			}
		},
	});

	const linkProvider = vscode.languages.registerDocumentLinkProvider("markdown", {
		provideDocumentLinks(document) {
			const text = document.getText();
			const links: vscode.DocumentLink[] = [];
			const movelazyRegex = /move_lazy/g;
			let match;
			while ((match = movelazyRegex.exec(text)) !== null) {
				const startPos = document.positionAt(match.index);
				const endPos = document.positionAt(match.index + match[0].length);
				links.push(new vscode.DocumentLink(new vscode.Range(startPos, endPos), vscode.Uri.parse("command:extension.runMoveLazy")));
			}

			const outputRegex = /```output/g;
			while ((match = outputRegex.exec(text)) !== null) {
				const startPos = document.positionAt(match.index);
				const endPos = document.positionAt(match.index + match[0].length);
				links.push(new vscode.DocumentLink(new vscode.Range(startPos, endPos), vscode.Uri.parse("command:extension.removeOutput")));
			}

			return links;
		},
	});

	function deleteOutputBlock(document: vscode.TextDocument, position: vscode.Position) {
		const text = document.getText();
		const outputBlockRegex = /```output\r?\n([\s\S]*?)```/g;
		let match;
		let edit = new vscode.WorkspaceEdit();

		while ((match = outputBlockRegex.exec(text)) !== null) {

			const start = document.positionAt(match.index);
			const end = document.positionAt(match.index + match[0].length);

			console.log(`Block found from line ${start.line} to ${end.line}`);
			console.log(`Clicked on line ${position.line}`);

			// Kiểm tra nếu vị trí click nằm trong phạm vi block output
			if (position.line >= start.line && position.line <= end.line) {
				console.log("Deleting output block...");
				edit.delete(document.uri, new vscode.Range(start, end));
				vscode.workspace.applyEdit(edit);
				vscode.window.showInformationMessage("✅ Output block deleted!");
				return;
			}
		}

		console.log("No matching output block found.");
	}


	const removeOutputCommand = vscode.commands.registerCommand("extension.removeOutput", async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage("❌ No active editor.");
			return;
		}
		deleteOutputBlock(editor.document, editor.selection.active);
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
			if (fs.existsSync(filePath)) { await fs.promises.unlink(filePath); }
		} catch (err) {
			console.error(`❌ Error deleting file: ${filePath}`, err);
		}
	}

	async function runMoveCode(document: vscode.TextDocument, targetCodeBlock: string, endOfCodeBlockPosition: vscode.Position) {
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
	}

	async function runMoveAi(document: vscode.TextDocument, targetCodeBlock: string, endOfCodeBlockPosition: vscode.Position) {
		let requestData = {
			"messages": [
				{
					"role": "user",
					"content": targetCodeBlock,
				}
			],
			"show_intermediate_steps": false
		};

		axios.post("http://localhost:3000/api", requestData)
			.then(async (response) => {
				// console.log("response", response.data);
				insertOutputIntoMarkdown(document, endOfCodeBlockPosition, response.data);
				vscode.window.showInformationMessage("✅ Execution successful!");
			})
			.catch((error) => {
				vscode.window.showErrorMessage(`❌ Execution error: ${error}`);
			});

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
		const codeBlockRegex = /```(rust|ai)\s*\n([\s\S]*?)```/g;
		let match, targetCodeBlock = null, endOfCodeBlockPosition = null, language = null;
		while ((match = codeBlockRegex.exec(text)) !== null) {
			const matchStartIndex = document.offsetAt(document.positionAt(match.index));
			if (matchStartIndex > wordIndex) {
				language = match[1];
				targetCodeBlock = match[2].trim();
				endOfCodeBlockPosition = document.positionAt(match.index + match[0].length);
				break;
			}
		}
		if (!targetCodeBlock || !endOfCodeBlockPosition) {
			vscode.window.showErrorMessage("❌ No code block found.");
			return;
		}
		if (language === "rust") {
			await runMoveCode(document, targetCodeBlock, endOfCodeBlockPosition);
		} else if (language === "ai") {
			await runMoveAi(document, targetCodeBlock, endOfCodeBlockPosition);
		} else {
			vscode.window.showErrorMessage("❌ Unsupported code block language.");
			return;
		}
	});

	context.subscriptions.push(hoverProvider, linkProvider, runMoveLazyCommand, removeOutputCommand);
}

export function deactivate() {
	console.log('Your extension "movelazy" is now deactivated!');
}
