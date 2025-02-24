import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";
import { DeployArgs } from "./types";

const execAsync = promisify(exec);

export default async function deploy(
  webview: vscode.Webview,
  args: DeployArgs
) {
  const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!workspacePath) {
    throw new Error("Workspace path not found");
  }
  console.log("deploychekc: ");

  let command = "aptos move publish";
  command += ` --named-addresses ${args.named_addresses}=default --max-gas 1000 --gas-unit-price 200`;

  console.log("deploy command ai che2: ", command);

  if (args.overrideSizeCheck) {
    command += " --override-size-check";
  }
  console.log("deploy command ai che3: ", command);

  if (args.chunkedPublish) {
    command += " --chunked-publish";
  }
  if (
    args.largePackagesModuleAddress &&
    args.largePackagesModuleAddress !==
    "0x0e1ca3011bdd07246d4d16d909dbb2d6953a86c4735d5acf5865d962c630cce7"
  ) {
    command += ` --large-packages-module-address ${args.largePackagesModuleAddress}`;
  }
  if (args.chunkSize && args.chunkSize !== "55000") {
    command += ` --chunk-size ${args.chunkSize}`;
  }
  if (args.includedArtifacts && args.includedArtifacts !== "sparse") {
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
  if (args.optimize && args.optimize !== "default") {
    command += ` --optimize ${args.optimize}`;
  }
  if (args.compilerVersion && args.compilerVersion !== "2.0") {
    command += ` --compiler-version ${args.compilerVersion}`;
  }
  if (args.languageVersion && args.languageVersion !== "2.1") {
    command += ` --language-version ${args.languageVersion}`;
  }
  if (args.senderAccount) {
    command += ` --sender-account ${args.senderAccount}`;
  }
  if (args.privateKey_deploy) {
    command += ` --private-key ${args.privateKey_deploy}`;
  }
  if (args.encoding && args.encoding !== "hex") {
    command += ` --encoding ${args.encoding}`;
  }
  if (args.expirationSecs && args.expirationSecs !== "30") {
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
  console.log("deploy command ai che: ", command);

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: workspacePath,
    });
    webview.postMessage({
      type: "cliStatus",
      success: true,
      message: stderr + stdout,
    });
    return;
  } catch (error) {
    webview.postMessage({
      type: "cliStatus",
      success: false,
      message: (error as Error).message,
    });
  }
}