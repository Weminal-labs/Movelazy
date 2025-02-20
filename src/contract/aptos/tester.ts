import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import { TesterSettings } from "./types";

const execAsync = promisify(exec);

export class AptosTesterService {
  async tester(
    webview: vscode.Webview,
    enabled: boolean,
    testName: string,
    settings: TesterSettings
  ) {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspacePath) {
      webview.postMessage({
        type: "testerStatus",
        success: false,
        message: "No workspace folder found.",
      });
      return;
    }

    try {
      // Check if Aptos CLI is installed
      await execAsync("aptos --version", { cwd: workspacePath });

      let accountAddress: string | null = null;
      function readAccountFromConfig() {
        if (!workspacePath) {
          console.error("Workspace path is undefined.");
          return;
        }
        const configFilePath = path.join(
          workspacePath,
          ".aptos",
          "config.yaml"
        ); // Đường dẫn đến file config.yaml

        if (fs.existsSync(configFilePath)) {
          try {
            const fileContents = fs.readFileSync(configFilePath, "utf8");
            const config: any = yaml.load(fileContents);

            if (
              config &&
              config.profiles &&
              config.profiles.default &&
              config.profiles.default.account
            ) {
              accountAddress = config.profiles.default.account;
              console.log("Account Address from config:", accountAddress);
            } else {
              console.error("Account not found in config file.");
            }
          } catch (error) {
            console.error("Error parsing config file:", error);
          }
        } else {
          console.error(`Config file ${configFilePath} does not exist.`);
        }
      }

      readAccountFromConfig();
      let command = `aptos move test --named-addresses ${
        settings.namedAddresses
      }=${accountAddress} ${enabled ? `-f ${testName}` : ""} `;

      const { stdout, stderr } = await execAsync(command, {
        cwd: workspacePath,
      });

      const isInformational = stdout.includes('"Success"');

      if (stderr && !isInformational) {
        webview.postMessage({
          type: "testerStatus",
          success: false,
          message: stderr,
        });
        return;
      }

      webview.postMessage({
        type: "testerStatus",
        success: true,
        message: stderr + stdout || "Compilation and publishing successful!",
      });
    } catch (error) {
      webview.postMessage({
        type: "testerStatus",
        success: false,
        message: (error as Error).message,
      });
    }
  }
}
