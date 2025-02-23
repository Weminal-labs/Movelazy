import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import SplitCmd from '../utils/SplitCmd';
import * as aptosCli from './Aptos-Cli';
import { ViewProvider } from '../ViewProvider';
import { TestArgs } from '../contract/aptos/types';
import compile from "../contract/aptos/compile";
import { AiResponse } from '../ai/chatbot';

function GetCmd(): string {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspacePath) {
        throw new Error("Workspace path not found");
    }

    const filePath = path.join(workspacePath, 'chat_with_ai.md');
    let result: string = "";
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        result = fileContent;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to read file: ${error.message}`);
        }
    }
    return result;
}

function ProcInit(webview: vscode.Webview, args: { [key: string]: string } | null) {
    //network: string, endpoint: string, faucetEndpoint: string, privateKey: string
    let network = "", endpoint = "", faucetEndpoint = "", privateKey = "";
    if (args) {
        network = args.network || "";
        endpoint = args.endpoint || "";
        faucetEndpoint = args.faucetEndpoint || "";
        privateKey = args.privateKey || "";
    }
    aptosCli.AptosInit(webview, network, endpoint, faucetEndpoint, privateKey);
}

function ProcMoveInit(webview: vscode.Webview, args: { [key: string]: string } | null) {
    //name: string, packageDir: string, namedAddresses: string, template: string, assumeYes: boolean, assumeNo: boolean, frameworkGitRev: string, frameworkLocalDir: string, skipFetchLatestGitDeps: boolean
    let name = "", packageDir = "", namedAddresses = "", template = "", assumeYes = false, assumeNo = false, frameworkGitRev = "", frameworkLocalDir = "", skipFetchLatestGitDeps = false;
    if (args) {
        name = args.name || "";
        packageDir = args.packageDir || "";
        namedAddresses = args.namedAddresses || "";
        template = args.template || "";
        assumeYes = Boolean(args.assumeYes) || false;
        assumeNo = Boolean(args.assumeNo) || false;
        frameworkGitRev = args.frameworkGitRev || "";
        frameworkLocalDir = args.frameworkLocalDir || "";
        skipFetchLatestGitDeps = Boolean(args.skipFetchLatestGitDeps) || false;
    }
    aptosCli.AptosMoveInit(webview, name, packageDir, namedAddresses, template, assumeYes, assumeNo, frameworkGitRev, frameworkLocalDir, skipFetchLatestGitDeps);
}

function ProcMoveTest(webview: vscode.Webview, args: { [key: string]: string } | null) {
    let testArgs: TestArgs = {
        namedAddresses: "",
        filter: "",
        ignoreCompileWarnings: false,
        packageDir: "",
        outputDir: "",
        overrideStd: "",
        skipFetchLatestGitDeps: false,
        skipAttributeChecks: false,
        dev: false,
        checkTestCode: false,
        optimize: "",
        bytecodeVersion: "",
        compilerVersion: "",
        languageVersion: "",
        moveVersion: "",
        instructions: "",
        coverage: false,
        dump: false,
    };

    if (args) {
        testArgs.namedAddresses = args.namedAddresses || "";
        testArgs.filter = args.filter || "";
        testArgs.ignoreCompileWarnings = Boolean(args.ignoreCompileWarnings) || false;
        testArgs.packageDir = args.packageDir || "";
        testArgs.outputDir = args.outputDir || "";
        testArgs.overrideStd = args.overrideStd || "";
        testArgs.skipFetchLatestGitDeps = Boolean(args.skipFetchLatestGitDeps) || false;
        testArgs.skipAttributeChecks = Boolean(args.skipAttributeChecks) || false;
        testArgs.dev = Boolean(args.dev) || false;
        testArgs.checkTestCode = Boolean(args.checkTestCode) || false;
        testArgs.optimize = args.optimize || "";
        testArgs.bytecodeVersion = args.bytecodeVersion || "";
        testArgs.compilerVersion = args.compilerVersion || "";
        testArgs.languageVersion = args.languageVersion || "";
        testArgs.moveVersion = args.moveVersion || "";
        testArgs.instructions = args.instructions || "";
        testArgs.coverage = Boolean(args.coverage) || false;
        testArgs.dump = Boolean(args.dump) || false;
    }

    aptosCli.MoveTest(webview, testArgs);
}

function ProcCompile(webview: vscode.Webview, args: { [key: string]: string } | null) {
    /*webview: vscode.Webview,
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
        optimization: "none" | "default" | "extra" */

    let saveMetadata = false, fetchDepsOnly = false, devMode = false, skipGitDeps = false, skipAttributeChecks = false, checkTestCode = false;
    let artifacts: "none" | "sparse" | "all" = "none";
    let optimization: "none" | "default" | "extra" = "none";
    let packageDir_compile = "", outputDir = "", namedAddresses_compile = "", overrideStd: string | null = null;

    if (args) {
        saveMetadata = Boolean(args.saveMetadata) || false;
        fetchDepsOnly = Boolean(args.fetchDepsOnly) || false;
        devMode = Boolean(args.devMode) || false;
        skipGitDeps = Boolean(args.skipGitDeps) || false;
        skipAttributeChecks = Boolean(args.skipAttributeChecks) || false;
        checkTestCode = Boolean(args.checkTestCode) || false;
        artifacts = args.artifacts as "none" | "sparse" | "all";
        optimization = args.optimization as "none" | "default" | "extra";
        packageDir_compile = args.packageDir_compile || "";
        outputDir = args.outputDir || "";
        namedAddresses_compile = args.namedAddresses_compile || "";
        overrideStd = args.overrideStd || null;
    }

    compile(webview, saveMetadata, fetchDepsOnly, artifacts, packageDir_compile, outputDir, namedAddresses_compile, overrideStd, devMode, skipGitDeps, skipAttributeChecks, checkTestCode, optimization);
}

function ProcCmdCase(ai_out: string) {
    const webviewView = ViewProvider.getWebviewView();
    const fmtCmd = SplitCmd(ai_out);

    if (webviewView === undefined) {
        throw new Error("Webview view not found");
    }

    if (webviewView) {
        const cmd = fmtCmd.cmd;
        console.log("Cmd: ", fmtCmd);
        try {
            switch (cmd) {
                case "aptos.init":
                    ProcInit(webviewView.webview, fmtCmd.args);
                    break;
                case "aptos.moveinit":
                    ProcMoveInit(webviewView.webview, fmtCmd.args);
                    break;
                case "aptos.movetest":
                    ProcMoveTest(webviewView.webview, fmtCmd.args);
                    break;
                case "aptos.compile":
                    ProcCompile(webviewView.webview, fmtCmd.args);
                    break;
                default:
                    console.log("Command not found");
                    break;
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to process AI output: ${error.message}`);
            }
        }
    } else {
        throw new Error("Webview view is null");
    }
}

export function AiCmd() {
    console.log("AiCmd");
    // ProcCmdCase("aptos.moveinit name=hello_blockchain template=hello-blockchain");
    console.log("Ai response: ", AiResponse("init project name: hello_blockchain template: hello-blockchain"));
}