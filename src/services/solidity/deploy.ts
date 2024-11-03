import * as vscode from 'vscode';
import { execAsync } from '../../utils/execAsync';
import { WorkspaceService } from './workspace';

export class DeployService {
    constructor(private context: vscode.ExtensionContext) { }

    async deploy(webview: vscode.Webview, settings: any) {
        const workspacePath = new WorkspaceService(this.context).getWorkspacePath();

        try {
            // Create deploy script
            const scriptContent = `
const hre = require("hardhat");

async function main() {
    const Contract = await hre.ethers.getContractFactory("${settings.selectedContract}");
    const contract = await Contract.deploy(${settings.constructorParams.join(', ')});
    await contract.deployed();
    console.log("Contract deployed to:", contract.address);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});`;

            // Execute deployment
            const { stdout, stderr } = await execAsync(
                `npx hardhat run --network ${settings.environment} deploy.js`,
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
