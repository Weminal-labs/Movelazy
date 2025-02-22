import { AptosCompilerService } from "./compiler";
import { AptosTesterService } from "./tester";
import { WorkspaceService } from "./workspace";
import { AptosDeployerService } from "./deployer";
import { CompileSettings } from "./types";
import * as vscode from "vscode";

export class AptosService {
  private compiler: AptosCompilerService;
  private tester: AptosTesterService;
  private workspace: WorkspaceService;
  private deployer: AptosDeployerService;

  constructor(context: vscode.ExtensionContext) {
    this.workspace = new WorkspaceService(context);
    this.compiler = new AptosCompilerService();
    this.tester = new AptosTesterService();
    this.deployer = new AptosDeployerService();
  }

  async compile(
    webview: vscode.Webview,
    saveMetadata: boolean,
    fetchDepsOnly: boolean,
    artifacts: "none" | "sparse" | "all",
    packageDir_compile: string,
    outputDir: string,
    namedAddresses_compile: string,
    overrideStd: string | null,
    devMode: boolean,
    skipGitDeps: boolean,
    skipAttributeChecks: boolean,
    checkTestCode: boolean,
    optimization: "none" | "default" | "extra"
  ) {
    return this.compiler.compile(
      webview,
      saveMetadata,
      fetchDepsOnly,
      artifacts,
      packageDir_compile,
      outputDir,
      namedAddresses_compile,
      overrideStd,
      devMode,
      skipGitDeps,
      skipAttributeChecks,
      checkTestCode,
      optimization
    );
  }

  async test(webview: vscode.Webview, enabled: boolean, testName: string) {
    const settings = this.workspace.getSettings();
    console.log("checksettings", settings);
    return this.tester.tester(webview, enabled, testName, settings);
  }

  async updateConfig(settings: any) {
    await this.workspace.saveSettings(settings);
  }

  getSettings() {
    return this.workspace.getSettings();
  }

  async deploy(webview: vscode.Webview) {
    const settings = this.workspace.getSettings();
    const { packageDir, namedAddresses } = settings;
    console.log("Named Addresses:", namedAddresses);
    console.log("checkk>>>", packageDir, namedAddresses);
    return this.deployer.deploy(webview, namedAddresses);
  }

  async getAccountAddress(webview: vscode.Webview) {
    return this.deployer.getAccountAddress(webview);
  }

  async requestFaucet(webview: vscode.Webview) {
    return this.deployer.requestFaucet(webview);
  }
}

function getPackageDir(): string {
  const config = vscode.workspace.getConfiguration("yourExtension");
  return config.get<string>("packageDir", "");
}
