import { CompilerService } from './compiler';
import { WorkspaceService } from './workspace';
import * as vscode from 'vscode';

export class SolidityService {
    private compiler: CompilerService;
    private workspace: WorkspaceService;

    constructor(context: vscode.ExtensionContext) {
        this.workspace = new WorkspaceService(context);
        this.compiler = new CompilerService();
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
} 