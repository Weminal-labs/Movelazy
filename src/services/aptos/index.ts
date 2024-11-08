import { AptosCompilerService } from './compiler';
import { AptosTesterService } from './tester';
import { WorkspaceService } from './workspace';
import { AptosDeployerService } from './deployer';
import * as vscode from 'vscode';

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

    async compile(webview: vscode.Webview) {
        const settings = this.workspace.getSettings();
        const { package: packageDir, nameAddresses: namedAddresses, moveVersion, optimizer, metadata } = settings;
        const { enabled: optimizerEnabled, level: optimizerLevel } = optimizer;
        const { bytecodeHash } = metadata;
        console.log("check>>", settings);
        return this.compiler.compile(webview, packageDir, namedAddresses, moveVersion, optimizerEnabled, optimizerLevel, bytecodeHash);
    }

    async deploy(webview: vscode.Webview) {
        const settings = this.workspace.getSettings();
        const { package: packageDir, nameAddresses: namedAddresses } = settings;
        console.log("Named Addresses:", namedAddresses);
        console.log("checkk>>>", packageDir, namedAddresses);
        return this.deployer.deploy(webview, namedAddresses);
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

function getPackageDir(): string {
    const config = vscode.workspace.getConfiguration('yourExtension');
    return config.get<string>('packageDir', '');
}