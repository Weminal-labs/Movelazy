import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { execAsync } from '../../utils/execAsync';

export class WorkspaceService {
    private readonly stateKey = 'compiler.settings';

    constructor(private context: vscode.ExtensionContext) { }

    private getWorkspacePath(): string {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace folder found');
        }
        return workspaceFolders[0].uri.fsPath;
    }

    public async saveSettings(settings: any) {
        await this.context.workspaceState.update(this.stateKey, settings);
    }

    public getSettings(): any {
        return this.context.workspaceState.get(this.stateKey) || {
            version: '0.8.20',
            evmVersion: 'london',
            optimizer: {
                enabled: false,
                runs: 200
            },
            metadata: {
                bytecodeHash: 'ipfs'
            },
            viaIR: false,
            debug: {
                debugInfo: ['location', 'snippet']
            }
        };
    }

    public async initializeWorkspace() {
        const workspacePath = this.getWorkspacePath();

        try {
            // Check if npm is installed
            await execAsync('npm --version');

            // Initialize npm if needed
            if (!fs.existsSync(path.join(workspacePath, 'package.json'))) {
                await execAsync('npm init -y', { cwd: workspacePath });
            }

            // Install Hardhat if not installed
            if (!fs.existsSync(path.join(workspacePath, 'node_modules', 'hardhat'))) {
                await execAsync('npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox', {
                    cwd: workspacePath
                });
            }

            return true;
        } catch (error) {
            throw new Error(`Failed to initialize workspace: ${(error as Error).message}`);
        }
    }

    public async updateHardhatConfig(settings: any) {
        const workspacePath = this.getWorkspacePath();
        const hardhatConfigPath = path.join(workspacePath, 'hardhat.config.ts');

        // Nếu file không tồn tại, tạo mới
        if (!fs.existsSync(hardhatConfigPath)) {
            // Kiểm tra và cài đặt hardhat nếu cần
            try {
                await execAsync('npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox', {
                    cwd: workspacePath
                });
            } catch (error) {
                throw new Error('Failed to install Hardhat. Please check your npm installation.');
            }
        }

        // Tạo nội dung config mới
        const configContent = `
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "${settings.version}",
    settings: {
      optimizer: {
        enabled: ${settings.optimizer.enabled},
        runs: ${settings.optimizer.runs}
      },
      evmVersion: "${settings.evmVersion}",
      viaIR: ${settings.viaIR},
      metadata: {
        bytecodeHash: "${settings.metadata.bytecodeHash}"
      }
    }
  }
};

export default config;
        `;

        // Ghi file
        await fs.promises.writeFile(hardhatConfigPath, configContent);
    }

    public async getContractFiles(): Promise<string[]> {
        const workspacePath = this.getWorkspacePath();
        const contractsPath = path.join(workspacePath, 'contracts');

        if (!fs.existsSync(contractsPath)) {
            return [];
        }

        const files = await fs.promises.readdir(contractsPath);
        return files.filter(file => file.endsWith('.sol'));
    }
}
