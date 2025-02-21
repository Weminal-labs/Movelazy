import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";
import { CompileSettings } from "./types";

const execAsync = promisify(exec);

export class AptosCompilerService {
  async compile(webview: vscode.Webview, settings: CompileSettings) {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

    if (!workspacePath) {
      webview.postMessage({
        type: "compileStatus",
        success: false,
        message: "No workspace folder found.",
      });
      return;
    }

    try {
      let command = `aptos move compile --named-addresses ${settings.namedAddresses}=default`;
      console.log("command: ", command);
      const { stdout, stderr } = await execAsync(command, {
        cwd: workspacePath,
      });

      webview.postMessage({
        type: "compileStatus",
        success: true,
        message: stderr + stdout || "Compilation successful!",
      });
    } catch (error) {
      webview.postMessage({
        type: "compileStatus",
        success: false,
        message: (error as Error).message,
      });
    }
  }
}
