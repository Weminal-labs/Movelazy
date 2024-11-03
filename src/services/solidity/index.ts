import { CompilerService } from './compiler';
import { WorkspaceService } from './workspace';
import { AccountService } from './account';
import { DeployService } from './deploy';
import * as vscode from 'vscode';

export class SolidityService {
    private compiler: CompilerService;
    private workspace: WorkspaceService;
    private account: AccountService;
    private deploy: DeployService;

    constructor(context: vscode.ExtensionContext) {
        this.workspace = new WorkspaceService(context);
        this.compiler = new CompilerService();
        this.account = new AccountService(context);
        this.deploy = new DeployService(context);
    }

    async compile(webview: vscode.Webview) {
        return this.compiler.compile(webview);
    }

    async initWorkspace() {
        return this.workspace.initializeWorkspace();
    }

    async updateConfig(settings: any) {
        await this.workspace.updateHardhatConfig(settings);
        await this.workspace.saveSettings(settings);
    }

    getSettings() {
        return this.workspace.getSettings();
    }

    async checkWorkspace() {
        return this.workspace.isHardhatWorkspace();
    }

    async clean(webview: vscode.Webview) {
        return this.compiler.clean(webview);
    }

    async startLocalNode(webview: vscode.Webview) {
        return this.account.startLocalNode(webview);
    }

    async stopLocalNode() {
        return this.account.stopLocalNode();
    }

    async runDeploy(webview: vscode.Webview, settings: any) {
        return this.deploy.deploy(webview, settings);
    }
} 