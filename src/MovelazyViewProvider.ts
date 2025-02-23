import * as vscode from "vscode";
import { SolidityService } from "./contract/solidity";
import { AptosService } from "./contract/aptos";
import { WorkspaceService } from "./contract/aptos/workspace";
import { DeployerService } from "./contract/solidity/deployer";
import {
  CheckAptos,
  CheckAptosInit,
  AptosInit,
  AptosMoveInit,
  AptosInfo,
  MoveTest,
} from "./services/Aptos-Cli";

export class MovelazyViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "MovelazyView";
  private readonly solidityService: SolidityService;
  private readonly aptosService: AptosService;
  private workspace: WorkspaceService;
  private deployerService: DeployerService;
  constructor(private readonly context: vscode.ExtensionContext) {
    this.workspace = new WorkspaceService(context);
    this.solidityService = new SolidityService(context);
    this.aptosService = new AptosService(context);
    this.deployerService = new DeployerService();
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, "webview", "build"),
      ],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      try {
        switch (message.command) {
          case "solidity.compile":
            await this.solidityService.updateCompilerConfig(message.settings);
            await this.solidityService.compile(webviewView.webview);
            break;
          case "solidity.deploy":
            console.log("handling deploy");
            try {
              const result = await this.deployerService.deploy(
                message.settings
              );
              webviewView.webview.postMessage({
                type: "deploySuccess",
                result: result,
              });
            } catch (error) {
              webviewView.webview.postMessage({
                type: "error",
                message: (error as Error).message,
              });
            }
            break;
          case "solidity.getSettings":
            const settings = this.solidityService.getSettings();
            webviewView.webview.postMessage({
              type: "settings",
              settings,
            });
            break;
          case "solidity.initWorkspace":
            webviewView.webview.postMessage({
              type: "cliStatus",
              loading: true,
            });
            try {
              await this.solidityService.initWorkspace();
              webviewView.webview.postMessage({
                type: "cliStatus",
                initialized: true,
                loading: false,
              });
            } catch (error) {
              webviewView.webview.postMessage({
                type: "cliStatus",
                error: (error as Error).message,
                loading: false,
              });
            }
            break;
          case "solidity.checkWorkspace":
            const isHardhatWorkspace =
              await this.solidityService.checkWorkspace();
            webviewView.webview.postMessage({
              type: "cliStatus",
              initialized: isHardhatWorkspace,
              loading: false,
            });
            break;
          case "solidity.clean":
            await this.solidityService.clean(webviewView.webview);
            break;
          case "solidity.startLocalNode":
            await this.solidityService.startLocalNode(webviewView.webview);
            break;
          case "solidity.stopLocalNode":
            await this.solidityService.stopLocalNode();
            break;

          case "aptos.check":
            const isAptosInstalled = await CheckAptos();
            webviewView.webview.postMessage({
              type: "CliStatus",
              installed: isAptosInstalled,
            });
            break;
          case "aptos.info":
            await AptosInfo(webviewView.webview);
            break;
          case "aptos.checkInit":
            const isAptosInitialized = await CheckAptosInit();
            webviewView.webview.postMessage({
              type: "CliStatus",
              initialized: isAptosInitialized,
            });
            break;
          case "aptos.init":
            const [network, endpoint, faucetEndpoint, privateKey] =
              message.initConfig;
            await AptosInit(
              webviewView.webview,
              network,
              endpoint,
              faucetEndpoint,
              privateKey
            );
            break;
          case "aptos.moveinit":
            const [
              name,
              packageDir,
              namedAddresses,
              template,
              assumeYes,
              assumeNo,
              frameworkGitRev,
              frameworkLocalDir,
              skipFetchLatestGitDeps,
            ] = message.initArgs;
            await AptosMoveInit(
              webviewView.webview,
              name,
              packageDir,
              namedAddresses,
              template,
              assumeYes,
              assumeNo,
              frameworkGitRev,
              frameworkLocalDir,
              skipFetchLatestGitDeps
            );
            break;

          case "aptos.compile":
            const [
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
              optimization,
            ] = message.compileArgs;
            await this.aptosService.compile(
              webviewView.webview,
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
            break;
          case "aptos.deploy":
            const [
              overrideSizeCheck,
              chunkedPublish,
              largePackagesModuleAddress,
              chunkSize,
              includedArtifacts,
              packageDir_deploy,
              outputDir_deploy,
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
              profile_gas,
            ] = message.deployArgs;
            await this.aptosService.deploy(
              webviewView.webview,
              overrideSizeCheck,
              chunkedPublish,
              largePackagesModuleAddress,
              chunkSize,
              includedArtifacts,
              packageDir_deploy,
              outputDir_deploy,
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
            break;
          case "aptos.checkProfile":
            await this.aptosService.checkProfile(webviewView.webview);
            break;

          case "aptos.movetest":
            await MoveTest(webviewView.webview, message.testArgs);
            break;

          case "aptos.checkFolder":
            await this.workspace.checkFolder(webviewView.webview);
            break;
        }
      } catch (error) {
        webviewView.webview.postMessage({
          type: "error",
          message: (error as Error).message,
        });
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "webview",
        "build",
        "assets",
        "index.js"
      )
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "webview",
        "build",
        "assets",
        "style.css"
      )
    );

    return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; script-src ${webview.cspSource} 'unsafe-inline'; style-src ${webview.cspSource} 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src ${webview.cspSource} https://fullnode.devnet.aptoslabs.com;">
                <title>MoveLazy</title>
                <link href="${styleUri}" rel="stylesheet">
                <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet">
            </head>
            <body>
                <div id="root"></div>
                <script>
                    (function() {
                        try {
                            const vscode = acquireVsCodeApi();
                            window.vscode = vscode;
                            console.log('VSCode API initialized successfully');
                        } catch (error) {
                            console.error('Failed to initialize VSCode API:', error);
                        }
                    })();
                </script>
                <script type="module" src="${scriptUri}"></script>
            </body>
            </html>`;
  }
}
