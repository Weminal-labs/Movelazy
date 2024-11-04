import { AptosCompilerService } from './compiler';
import { WorkspaceService } from './workspace';
import * as vscode from 'vscode';

export class AptosService {
    private compiler: AptosCompilerService;
    private workspace: WorkspaceService;

    constructor(context: vscode.ExtensionContext) {
        this.workspace = new WorkspaceService(context);
        this.compiler = new AptosCompilerService();
    }

    async compile(webview: vscode.Webview) {
        const settings = this.workspace.getSettings();
        const packageDir = settings.package;
        const namedAddresses = settings.nameAddresses;
        const moveVersion = settings.moveVersion;
        const optimizer = settings.optimizer.enabled;
        const optimizerlevel = settings.optimizer.level;
        const bytecodeHash = settings.metadata?.bytecodeHash;
        console.log("check>>", settings);
        return this.compiler.compile(webview, packageDir, namedAddresses, moveVersion, optimizer, optimizerlevel, bytecodeHash);
    }

    async initWorkspace() {
        return this.workspace.initializeWorkspace();
    }

    async updateConfig(settings: any) {
        await this.workspace.updateAptosConfig(settings);
        await this.workspace.saveSettings(settings);
    }

    getSettings() {
        return this.workspace.getSettings();
    }

    async checkWorkspace() {
        return this.workspace.isAptosWorkspace();
    }
    async clean(webview: vscode.Webview) {
        return this.compiler.clean(webview);
    }
}