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



	const runMoveLazyCommand = vscode.commands.registerCommand("extension.runMoveLazy", async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage("❌ Không tìm thấy file đang mở.");
			return;
		}

		const document = editor.document;
		const text = document.getText();
		let wordIndex: number | null = null;

		// 🔍 Nếu có vị trí từ Hover, ưu tiên dùng
		if (lastHoveredMoveLazyPosition) {
			wordIndex = document.offsetAt(lastHoveredMoveLazyPosition);
			console.log(`✅ Using hovered move_lazy at index: ${wordIndex}`);
		} else {
			// 🔍 Nếu chưa từng hover, tìm move_lazy gần nhất với con trỏ
			const position = editor.selection.active;
			const moveLazyRegex = /move_lazy/g;
			let match;
			let closestMoveLazy = null;
			let closestDistance = Infinity;
			const cursorIndex = document.offsetAt(position);

			while ((match = moveLazyRegex.exec(text)) !== null) {
				const matchIndex = match.index;
				const distance = Math.abs(cursorIndex - matchIndex);

				if (distance < closestDistance) {
					closestMoveLazy = matchIndex;
					closestDistance = distance;
				}
			}

			if (closestMoveLazy !== null) {
				wordIndex = closestMoveLazy;
				console.log(`✅ Using closest move_lazy at index: ${wordIndex}`);
			} else {
				vscode.window.showErrorMessage("❌ Không tìm thấy `move_lazy`.");
				return;
			}
		}

		// 🔍 Tìm code block ngay sau `move_lazy`
		const codeBlockRegex = /```rust\s*\r?\n([\s\S]*?)```/g;
		let match;
		let targetCodeBlock = null;
		let targetCodeBlockIndex = -1;

		while ((match = codeBlockRegex.exec(text)) !== null) {
			const codeBlockIndex = match.index;
			if (codeBlockIndex > wordIndex) {
				targetCodeBlock = match[1].trim();
				targetCodeBlockIndex = codeBlockIndex;
				console.log("✅ Matched Rust Code Block:\n", targetCodeBlock);
				break;
			}
		}

		if (!targetCodeBlock) {
			vscode.window.showErrorMessage("❌ Không tìm thấy code Rust bên dưới.");
			return;
		}

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
					vscode.window.showErrorMessage(`❌ Lỗi biên dịch: ${stderr}`);
					return;
				}

				console.log("✅ Execution Output:\n", stdout.trim());

				// 🗑 Xóa file tạm
				fs.unlinkSync(tempFilePath);
				fs.unlinkSync(outputFilePath);

				// ✅ Chèn kết quả ngay bên dưới block
				const edit = new vscode.WorkspaceEdit();
				if (!match) { return; }
				const newPosition = document.positionAt(targetCodeBlockIndex + match[0].length);
				const outputMarkdown = `\n\`\`\`output\n${stdout.trim()}\n\`\`\`\n`;
				edit.insert(document.uri, newPosition, outputMarkdown);

				vscode.workspace.applyEdit(edit);
				vscode.window.showInformationMessage("✅ Rust code đã chạy thành công!");
			});
		});
	});



	context.subscriptions.push(hoverProvider, linkProvider, runMoveLazyCommand);
}

export function deactivate() {
	console.log('Your extension "movelazy" is now deactivated!');
}