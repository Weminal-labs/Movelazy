import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";
import { CompileArgs, DeployArgs } from "./types";
const execAsync = promisify(exec);

export class AptosDeployerService {
  async checkProfile(webview: vscode.Webview) {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspacePath) {
      console.error("Workspace path is undefined.");
      return null;
    }
    try {
      const isProfile = true;
      const accountAddress = await this.getAccount();
      const network = await this.getNetWork();
      const balance = await this.checkBalance();
      console.log("check3", accountAddress, network, balance);
      webview.postMessage({
        type: "cliStatus",
        message: { accountAddress, network, balance, isProfile },
      });
      return;
    } catch (error) {
      console.error("Error parsing config file:", error);
    }
    return Promise.reject("Failed to read account from config");
  }
  async checkBalance() {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspacePath) {
      console.log("No workspace");
      return;
    }

    const { stdout, stderr } = await execAsync(`aptos account balance`, {
      cwd: workspacePath,
    });
    if (stderr) {
      console.error("Error getting account balance:", stderr);
      return null;
    }
    const result = JSON.parse(stdout);
    const balance = result.Result[0].balance;
    return balance;
  }
  catch(error: any) {
    console.error("Error executing command:", error);
    return null;
  }
    const { stdout, stderr } = await execAsync(`aptos account balance`, {
      cwd: workspacePath,
    });
    if (stderr) {
      console.error("Error getting account balance:", stderr);
      return null;
    }
    const result = JSON.parse(stdout);
    const balance = result.Result[0].balance;
    return balance;
  }
  catch(error: any) {
    console.error("Error executing command:", error);
    return null;
  }

  async getAccount() {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspacePath) {
      console.log("No workspace");
      return;
    }
    try {
      const { stdout, stderr } = await execAsync(`aptos config show-profiles`, {
        cwd: workspacePath,
      });
      if (stderr) {
        console.error("Error getting account:", stderr);
        return null;
      }
      const result = JSON.parse(stdout);
      const account = result.Result.default.account;
      return account;
    } catch (error) {
      console.error("Error executing account command:", error);
      return null;
    }
  }

  async getNetWork() {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspacePath) {
      console.log("No workspace");
      return;
    }
    try {
      const { stdout, stderr } = await execAsync(`aptos config show-profiles`, {
        cwd: workspacePath,
      });
      if (stderr) {
        console.error("Error getting network:", stderr);
        return null;
      }
      const result = JSON.parse(stdout);
      const network = result.Result.default.rest_url;
      return network;
    } catch (error) {
      console.error("Error executing network command:", error);
      return null;
    }
  }
  async deploy(webview: vscode.Webview, args: DeployArgs) {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspacePath) {
      throw new Error("Workspace path not found");
    }
    let command = "aptos move publish";

    command += ` --named-addresses ${args.namedAddresses_deploy}=default --gas-unit-price ${args.gasUnitPrice} --max-gas ${args.maxGas}`;

    if (args.overrideSizeCheck) {
      command += " --override-size-check";
    }
    if (args.chunkedPublish) {
      command += " --chunked-publish";
    }
    if (
      args.largePackagesModuleAddress !==
      "0x0e1ca3011bdd07246d4d16d909dbb2d6953a86c4735d5acf5865d962c630cce7"
    ) {
      command += ` --large-packages-module-address ${args.largePackagesModuleAddress}`;
    }
    if (args.chunkSize !== "55000") {
      command += ` --chunk-size ${args.chunkSize}`;
    }
    if (args.includedArtifacts !== "sparse") {
      command += ` --included-artifacts ${args.includedArtifacts}`;
    }
    if (args.packageDir_deploy) {
      command += ` --package-dir ${args.packageDir_deploy}`;
    }
    if (args.outputDir_deploy) {
      command += ` --output-dir ${args.outputDir_deploy}`;
    }
    if (args.overrideStd_deploy) {
      command += ` --override-std ${args.overrideStd_deploy}`;
    }
    if (args.skipGitDeps_deploy) {
      command += " --skip-git-deps";
    }
    if (args.skipAttributeChecks_deploy) {
      command += " --skip-attribute-checks";
    }
    if (args.checkTestCode_deploy) {
      command += " --check-test-code";
    }
    if (args.optimize !== "default") {
      command += ` --optimize ${args.optimize}`;
    }
    if (args.compilerVersion !== "2.0") {
      command += ` --compiler-version ${args.compilerVersion}`;
    }
    if (args.languageVersion !== "2.1") {
      command += ` --language-version ${args.languageVersion}`;
    }
    if (args.senderAccount) {
      command += ` --sender-account ${args.senderAccount}`;
    }
    if (args.privateKey_deploy) {
      command += ` --private-key ${args.privateKey_deploy}`;
    }
    if (args.encoding !== "hex") {
      command += ` --encoding ${args.encoding}`;
    }
    if (args.expirationSecs !== "30") {
      command += ` --expiration-secs ${args.expirationSecs}`;
    }
    if (args.assume_yes) {
      command += " --assume-yes";
    }
    if (args.assume_no) {
      command += " --assume-no";
    }
    if (args.local) {
      command += " --local";
    }
    if (args.benmark) {
      command += " --benmark";
    }
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: workspacePath,
      });
      if (stderr || stdout) {
        webview.postMessage({
          type: "cliStatus",
          success: true,
          message: { out: stderr + stdout, isProfile: false },
        });
        return;
      }
    } catch (error) {
      webview.postMessage({
        type: "cliStatus",
        success: false,
        message: (error as Error).message,
      });
    }
  }
}

