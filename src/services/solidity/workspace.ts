import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { execAsync } from '../../utils/execAsync';

export interface HardhatNetworkConfig {
    url?: string;
    accounts?: string[];
    chainId?: number;
}

export interface CompilerSettings {
    version: string;
    evmVersion: string;
    optimizer: {
        enabled: boolean;
        runs: number;
    };
    metadata: {
        bytecodeHash: string;
    };
    viaIR: boolean;
    debug: {
        debugInfo: string[];
    };
    networks?: {
        [key: string]: HardhatNetworkConfig;
    };
}

export class WorkspaceService {
    private readonly stateKey = 'compiler.settings';

    constructor(private context: vscode.ExtensionContext) { }

    public async saveSettings(settings: any) {
        await this.context.workspaceState.update(this.stateKey, settings);
    }

    public getWorkspacePath(): string {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace folder found');
        }
        return workspaceFolders[0].uri.fsPath;
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
                await execAsync('npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox typescript ts-node', {
                    cwd: workspacePath
                });
            }

            // Create tsconfig.json if it doesn't exist
            const tsconfigPath = path.join(workspacePath, 'tsconfig.json');
            if (!fs.existsSync(tsconfigPath)) {
                const tsconfigContent = {
                    compilerOptions: {
                        module: "NodeNext",
                        moduleResolution: "NodeNext",
                        target: "es2020",
                        outDir: "dist",
                        rootDir: "./",
                        strict: true,
                        esModuleInterop: true,
                        forceConsistentCasingInFileNames: true
                    }
                };
                await fs.promises.writeFile(
                    tsconfigPath, 
                    JSON.stringify(tsconfigContent, null, 2)
                );
            }

            // Create hardhat.config.ts with default settings
            const hardhatConfigPath = path.join(workspacePath, 'hardhat.config.ts');
            if (!fs.existsSync(hardhatConfigPath)) {
                const defaultSettings = this.getSettings();
                const configContent = `
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "${defaultSettings.version}",
    settings: {
      optimizer: {
        enabled: ${defaultSettings.optimizer.enabled},
        runs: ${defaultSettings.optimizer.runs}
      },
      evmVersion: "${defaultSettings.evmVersion}",
      viaIR: ${defaultSettings.viaIR},
      metadata: {
        bytecodeHash: "${defaultSettings.metadata.bytecodeHash}"
      }
    }
  }
};

export default config;
                `;
                await fs.promises.writeFile(hardhatConfigPath, configContent);
            }

            // Create contracts directory if it doesn't exist
            const contractsDir = path.join(workspacePath, 'contracts');
            if (!fs.existsSync(contractsDir)) {
                await fs.promises.mkdir(contractsDir);
            }

            return true;
        } catch (error) {
            throw new Error(`Failed to initialize workspace: ${(error as Error).message}`);
        }
    }

    public async updateHardhatConfig(settings: CompilerSettings) {
        const workspacePath = this.getWorkspacePath();
        const hardhatConfigPath = path.join(workspacePath, 'hardhat.config.ts');

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
    },
    networks: {
        hardhat: {},
        ${settings.networks ? Object.entries(settings.networks).map(([name, config]) => `
        ${name}: {
            url: "${config.url}",
            accounts: ${JSON.stringify(config.accounts || [])},
            chainId: ${config.chainId || 'undefined'}
        }`).join(',') : ''}
    }
};

export default config;`;

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

    public async isHardhatWorkspace(): Promise<boolean> {
        const workspacePath = this.getWorkspacePath();
        
        try {
            // Check 1: npx hardhat --version
            try {
                await execAsync('npx hardhat --version', { cwd: workspacePath });
            } catch {
                return false;
            }

            // Check 2: hardhat.config.ts exists
            const configExists = fs.existsSync(path.join(workspacePath, 'hardhat.config.ts'));
            if (!configExists) {
                return false;
            }

            // Check 3: node_modules/hardhat exists
            const nodeModulesExists = fs.existsSync(path.join(workspacePath, 'node_modules', 'hardhat'));
            if (!nodeModulesExists) {
                return false;
            }

            // Check 4: package.json has hardhat dependency
            const packageJsonPath = path.join(workspacePath, 'package.json');
            if (!fs.existsSync(packageJsonPath)) {
                return false;
            }

            const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf8'));
            const hasHardhatDep = !!(packageJson.dependencies?.hardhat || packageJson.devDependencies?.hardhat);
            
            return hasHardhatDep;
        } catch {
            return false;
        }
    }
}
