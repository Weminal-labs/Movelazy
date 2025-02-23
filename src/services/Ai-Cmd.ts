import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import SplitCmd from '../utils/SplitCmd';
import * as aptosCli from './Aptos-Cli';

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

function ProcInit(args: { [key: string]: string } | null) {
    //network: string, endpoint: string, faucetEndpoint: string, privateKey: string
    let network = "", endpoint = "", faucetEndpoint = "", privateKey = "";
    if (args) {
        network = args.network;
        endpoint = args.endpoint;
        faucetEndpoint = args.faucetEndpoint;
        privateKey = args.privateKey;
    }
    aptosCli.AptosInit(network, endpoint, faucetEndpoint, privateKey);
}

function ProcCmdCase(ai_out: string) {
    const fmtCmd = SplitCmd(ai_out);
    const cmd = fmtCmd.cmd;
    try {
        switch (cmd) {
            case "aptos.init":

                break;
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to process AI output: ${error.message}`);
        }
    }
}