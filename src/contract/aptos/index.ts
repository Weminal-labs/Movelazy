import { AptosCompilerService } from "./compiler";
import { WorkspaceService } from "./workspace";
import { AptosDeployerService } from "./deployer";
import * as vscode from "vscode";

export class AptosService {
  private compiler: AptosCompilerService;
  private workspace: WorkspaceService;
  private deployer: AptosDeployerService;

  constructor(context: vscode.ExtensionContext) {
    this.workspace = new WorkspaceService(context);
    this.compiler = new AptosCompilerService();
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
    overrideStd_deploy: string,
    skipGitDeps_deploy: boolean,
    skipAttributeChecks_deploy: boolean,
    checkTestCode_deploy: boolean,
    optimize: string,
    bytecodeVersion: string,
    compilerVersion: string,
    languageVersion: string,
    senderAccount: string,
    privateKey_deploy: string,
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
    return this.deployer.deploy(
      webview,
      overrideSizeCheck,
      chunkedPublish,
      largePackagesModuleAddress,
      chunkSize,
      includedArtifacts,
      packageDir_deploy,
      outputDir,
      namedAddresses_deploy,
      overrideStd_deploy,
      skipGitDeps_deploy,
      skipAttributeChecks_deploy,
      checkTestCode_deploy,
      optimize,
      bytecodeVersion,
      compilerVersion,
      languageVersion,
      senderAccount,
      privateKey_deploy,
      encoding,
      gasUnitPrice,
      maxGas,
      expirationSecs,
      assume_yes,
      assume_no,
      local,
      benmark,
      profile_gas
    );
  }

  async checkProfile(webview: vscode.Webview) {
    return this.deployer.checkProfile(webview);
  }
}
