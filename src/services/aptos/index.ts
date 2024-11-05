import { AptosCompilerService } from './compiler';
import { AptosTesterService } from './tester';
import { WorkspaceService } from './workspace';
import * as vscode from 'vscode';

export class AptosService {
    private compiler: AptosCompilerService;
    private tester: AptosTesterService;
    private workspace: WorkspaceService;

    constructor(context: vscode.ExtensionContext) {
        this.workspace = new WorkspaceService(context);
        this.compiler = new AptosCompilerService();
        this.tester = new AptosTesterService();
    }

    async compile(webview: vscode.Webview) {
        const settings = this.workspace.getSettings();
        const packageDir = settings.package;
        const namedAddresses = settings.nameAddresses;
        const moveVersion = settings.moveVersion;
        const optimizer = settings.optimizer.enabled;
        const optimizerlevel = settings.optimizer.level;
        const bytecodeHash = settings.metadata.bytecodeHash;
        console.log("check>>", settings);
        return this.compiler.compile(webview, packageDir, namedAddresses, moveVersion, optimizer, optimizerlevel, bytecodeHash);
    }

    async test(webview: vscode.Webview, enabled: boolean, testName: string) {
        const settings = this.workspace.getSettings();
        const moveVersion = settings.moveVersion;
        const optimizer = settings.optimizer.enabled;
        const optimizerlevel = settings.optimizer.level;
        const bytecodeHash = settings.metadata.bytecodeHash;
        return this.tester.tester(webview, enabled, testName, moveVersion, optimizer, optimizerlevel, bytecodeHash);
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