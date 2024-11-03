import * as vscode from 'vscode';
import { execAsync } from '../../utils/execAsync';
import { WorkspaceService } from './workspace';
import { DeploymentSettings } from './types';

export class DeployService {
    constructor(private context: vscode.ExtensionContext) { }

    async deploy(webview: vscode.Webview, settings: DeploymentSettings) {
        const workspacePath = new WorkspaceService(this.context).getWorkspacePath();
        const networkName = settings.environment === 'local' ? 'hardhat' : settings.network.name;

        try {
            // Create deploy script
            const scriptContent = `
const hre = require("hardhat");

async function main() {
    const Contract = await hre.ethers.getContractFactory("${settings.selectedContract}");
    const contract = await Contract.deploy(${settings.constructorParams.map(p => p.value).join(', ')});
    await contract.deployed();
    console.log("Contract deployed to:", contract.address);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});`;

            // Execute deployment
            const { stdout, stderr } = await execAsync(
                `npx hardhat run --network ${networkName} deploy.js`,
                { cwd: workspacePath }
            );

            if (stderr) {
                webview.postMessage({
                    type: 'deployStatus',
                    success: false,
                    message: stderr
                });
                return;
            }

            webview.postMessage({
                type: 'deployStatus',
                success: true,
                message: stdout
            });

        } catch (error) {
            webview.postMessage({
                type: 'deployStatus',
                success: false,
                message: (error as Error).message
            });
        }
    }
}
