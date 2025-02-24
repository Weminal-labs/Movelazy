import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";
import { CompileArgs } from "./types";

const execAsync = promisify(exec);

export class AptosCompilerService {
  async compile(webview: vscode.Webview, args: CompileArgs) {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspacePath) {
      throw new Error("Workspace path not found");
    }

    let command = "aptos move compile";
    command += ` --named-addresses ${args.named_addresses}=default`;

    if (args.optimization !== "default") {
      command += ` --optimize ${args.optimization}`;
    }
    if (args.artifacts !== "sparse") {
      command += ` --included-artifacts ${args.artifacts}`;
    }
    if (args.saveMetadata) {
      command += " --save-metadata";
    }
    if (args.devMode) {
      command += " --dev";
    }
    if (args.skipGitDeps) {
      command += " --skip-fetch-latest-git-deps";
    }
    if (args.skipAttributeChecks) {
      command += " --skip-attribute-checks";
    }
    if (args.checkTestCode) {
      command += " --check-test-code";
    }
    if (args.packageDir_compile) {
      command += ` --package-dir ${args.packageDir_compile}`;
    }
    if (args.outputDir) {
      command += ` --output-dir ${args.outputDir}`;
    }
    if (args.fetchDepsOnly) {
      command += " --fetch-deps-only";
    }
    if (args.overrideStd) {
      command += ` --override-std ${args.overrideStd}`;
    }

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: workspacePath,
      });
      webview.postMessage({
        type: "cliStatus",
        success: true,
        message: stderr + stdout,
      });
    } catch (error) {
      webview.postMessage({
        type: "cliStatus",
        success: false,
        message: (error as Error).message,
      });
    }
  }
}
