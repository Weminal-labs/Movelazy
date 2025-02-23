import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);

export class AptosDeployerService {
  async checkProfile(webview: vscode.Webview) {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspacePath) {
      console.error("Workspace path is undefined.");
      return null;
    }
    try {
      const accountAddress = await this.getAccount();
      const network = await this.getNetWork();
      const balance = await this.checkBalance();
      console.log("check3", accountAddress, network, balance);
      webview.postMessage({
        type: "profileStatus",
        message: { accountAddress, network, balance },
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
  async deploy(
    webview: vscode.Webview,
    overrideSizeCheck: boolean,
    chunkedPublish: boolean,
    largePackagesModuleAddress: string,
    chunkSize: string,
    includedArtifacts: string,
    packageDir_deploy: string,
    outputDir: string,
    namedAddresses_deploy: string,
    overrideStd: string,
    skipGitDeps: boolean,
    skipAttributeChecks: boolean,
    checkTestCode: boolean,
    optimize: string,
    bytecodeVersion: string,
    compilerVersion: string,
    languageVersion: string,
    senderAccount: string,
    privateKey: string,
    encoding: string,
    gasUnitPrice: string,
    maxGas: string,
    expirationSecs: string,
    assume_yes: boolean,
    assume_no: boolean,
    local: boolean,
    benmark: boolean,
    profile_gas: boolean
  ) {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspacePath) {
      throw new Error("Workspace path not found");
    }
    let command = "aptos move publish";

    command += ` --named-addresses ${namedAddresses_deploy}=default --gas-unit-price ${gasUnitPrice} --max-gas ${maxGas}`;

    if (overrideSizeCheck) {
      command += " --override-size-check";
    }
    if (chunkedPublish) {
      command += " --chunked-publish";
    }
    if (
      largePackagesModuleAddress !==
      "0x0e1ca3011bdd07246d4d16d909dbb2d6953a86c4735d5acf5865d962c630cce7"
    ) {
      command += ` --large-packages-module-address ${largePackagesModuleAddress}`;
    }
    if (chunkSize !== "55000") {
      command += ` --chunk-size ${chunkSize}`;
    }
    if (includedArtifacts !== "sparse") {
      command += ` --included-artifacts ${includedArtifacts}`;
    }
    if (packageDir_deploy) {
      command += ` --package-dir ${packageDir_deploy}`;
    }
    if (outputDir) {
      command += ` --output-dir ${outputDir}`;
    }
    if (overrideStd) {
      command += ` --override-std ${overrideStd}`;
    }
    if (skipGitDeps) {
      command += " --skip-git-deps";
    }
    if (skipAttributeChecks) {
      command += " --skip-attribute-checks";
    }
    if (checkTestCode) {
      command += " --check-test-code";
    }
    if (optimize !== "default") {
      command += ` --optimize ${optimize}`;
    }
    if (compilerVersion !== "2.0") {
      command += ` --compiler-version ${compilerVersion}`;
    }
    if (languageVersion !== "2.1") {
      command += ` --language-version ${languageVersion}`;
    }
    if (senderAccount) {
      command += ` --sender-account ${senderAccount}`;
    }
    if (privateKey) {
      command += ` --private-key ${privateKey}`;
    }
    if (encoding !== "hex") {
      command += ` --encoding ${encoding}`;
    }
    if (expirationSecs !== "30") {
      command += ` --expiration-secs ${expirationSecs}`;
    }
    if (assume_yes) {
      command += " --assume-yes";
    }
    if (assume_no) {
      command += " --assume-no";
    }
    if (local) {
      command += " --local";
    }
    if (benmark) {
      command += " --benmark";
    }
    if (profile_gas) {
      command += " --profile-gas";
    }

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: workspacePath,
      });
      if (stderr || stdout) {
        webview.postMessage({
          type: "cliStatus",
          success: true,
          message: stderr + stdout,
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
