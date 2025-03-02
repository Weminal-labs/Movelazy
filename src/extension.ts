import * as vscode from 'vscode';
import { ViewProvider } from './ViewProvider';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';


export function activate(context: vscode.ExtensionContext) {
	let lastHoveredMoveLazyPosition: vscode.Position | null = null;

	console.log('Congratulations, your extension "movelazy" is now active!');

	const provider = new ViewProvider(context);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ViewProvider.viewType, provider)
	);

	const hoverProvider = vscode.languages.registerHoverProvider("markdown", {
		provideHover(document, position) {
			const range = document.getWordRangeAtPosition(position);
			if (!range) { return; }

			const word = document.getText(range);
			if (word === "move_lazy") {
				// 🔹 Lưu vị trí của move_lazy khi hover vào
				lastHoveredMoveLazyPosition = position;

				// 🎨 Hiệu ứng highlight
				const decorationType = vscode.window.createTextEditorDecorationType({
					textDecoration: "underline",
					backgroundColor: "rgba(255, 255, 0, 0.3)",
				});

				const editor = vscode.window.activeTextEditor;
				if (editor) {
					editor.setDecorations(decorationType, [range]);
					setTimeout(() => editor.setDecorations(decorationType, []), 1500);
				}

				// 🔹 Tạo tooltip khi hover
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
				const range = new vscode.Range(startPos, endPos);

				// 📌 Tạo liên kết để chạy lệnh
				const link = new vscode.DocumentLink(
					range,
					vscode.Uri.parse("command:extension.runMoveLazy")
				);
				links.push(link);
			}

			return links;
		},
	});


	function insertOutputIntoMarkdown(document: vscode.TextDocument, insertPosition: vscode.Position, outputText: string) {
		const edit = new vscode.WorkspaceEdit();
		const outputMarkdown = `\n\`\`\`output\n${outputText.trim()}\n\`\`\`\n`;

		// console.log("Chèn output vào vị trí:", insertPosition);
		// console.log("🔹 Output:\n", outputMarkdown);

		edit.insert(document.uri, insertPosition, outputMarkdown);
		vscode.workspace.applyEdit(edit).then(success => {
			if (success) {
				// console.log("✅ Edit applied successfully");
			} else {
				vscode.window.showErrorMessage("❌ Failed to apply edit");
			}
		}, error => {
			vscode.window.showErrorMessage("❌ Error applying edit:", error);
		});
	}

	const runMoveLazyCommand = vscode.commands.registerCommand("extension.runMoveLazy", async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage("❌ Could not find current opening file.");
			return;
		}

		const document = editor.document;
		const text = document.getText();
		let wordIndex: number | null = null;

		// 📌 Lấy vị trí `move_lazy`
		if (lastHoveredMoveLazyPosition) {
			wordIndex = document.offsetAt(lastHoveredMoveLazyPosition);
		} else {
			vscode.window.showErrorMessage("❌ Could not find `move_lazy`.");
			return;
		}

		// 🔍 Tìm code block Rust ngay sau `move_lazy`
		const codeBlockRegex = /```rust\s*\r?\n([\s\S]*?)```/g;
		let match;
		let targetCodeBlock = null;
		let targetCodeBlockIndex = -1;
		let endOfCodeBlockPosition: vscode.Position | null = null;

		while ((match = codeBlockRegex.exec(text)) !== null) {
			const codeBlockIndex = match.index;
			if (codeBlockIndex > wordIndex) {
				targetCodeBlock = match[1].trim();
				targetCodeBlockIndex = codeBlockIndex;

				// Xác định vị trí cuối cùng của block code để chèn output
				const codeBlockEndOffset = codeBlockIndex + match[0].length;
				endOfCodeBlockPosition = document.positionAt(codeBlockEndOffset);

				break;
			}
		}

		if (!targetCodeBlock || !endOfCodeBlockPosition) {
			vscode.window.showErrorMessage("❌ Could not find code in the block.");
			return;
		}

		// console.log("✅ Chạy Rust code block tại vị trí:", targetCodeBlockIndex);
		// console.log("🔹 Nội dung code:\n", targetCodeBlock);

		// 📌 Tạo file tạm chứa code
		const tempFilePath = path.join(__dirname, "temp_lazy_code.rs");
		fs.writeFileSync(tempFilePath, targetCodeBlock);

		// 📌 File thực thi tạm thời
		const outputFilePath = path.join(__dirname, "temp_lazy_exec");

		// 📌 Kiểm tra Rust đã cài chưa
		exec(`rustc --version`, (error) => {
			if (error) {
				vscode.window.showErrorMessage("❌ Rust compiler (rustc) chưa được cài đặt.");
				return;
			}

			// 📌 Biên dịch và chạy code
			exec(`rustc "${tempFilePath}" -o "${outputFilePath}" && "${outputFilePath}"`, (error, stdout, stderr) => {
				if (error) {
					vscode.window.showErrorMessage(`❌ Error compile: ${stderr}`);
					return;
				}

				const outputText = stdout.trim();


				// 🗑 Xóa file tạm
				try {
					if (fs.existsSync(tempFilePath)) {
						fs.unlinkSync(tempFilePath);
						console.log("Temporary Rust code file deleted:", tempFilePath); // Add this line for logging
					}
				} catch (err) {
					console.error("❌ Error deleting temporary Rust code file:", err); // Add this line for logging
				}
				try {
					if (fs.existsSync(outputFilePath)) {
						fs.unlinkSync(outputFilePath);
						console.log("Temporary executable file deleted:", outputFilePath); // Add this line for logging
					}
				} catch (err) {
					console.error("❌ Error deleting temporary executable file:", err); // Add this line for logging
				}

				// ✅ Chèn kết quả ngay bên dưới block Rust
				insertOutputIntoMarkdown(document, endOfCodeBlockPosition, outputText);

				vscode.window.showInformationMessage("✅ Execute code block successfully!");
			});
		});
	});



	context.subscriptions.push(hoverProvider, linkProvider, runMoveLazyCommand);
}

export function deactivate() {
	console.log('Your extension "movelazy" is now deactivated!');
}