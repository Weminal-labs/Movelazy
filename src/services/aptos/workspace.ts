import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { execAsync } from '../../utils/execAsync';

const execAsync = promisify(exec);

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
    console.log("Saving settings:", settings);
    await this.context.workspaceState.update(this.stateKey, settings);
  }

  public getSettings(): any {
    const settings = this.context.workspaceState.get(this.stateKey) || {
      version: '4.3.0',
      moveVersion: 'Move 1',
      optimizer: {
        enabled: false,
        level: "default"
      },
      metadata: {
        bytecodeHash: '6',
      },
      packageDir: "",
      nameAddresses: "",
      network: 'https://aptos.testnet.porto.movementlabs.xyz/v1'
    };
    console.log("Retrieved settings:", settings);
    return settings;
  }

  public async initializeWorkspace() {
    const workspacePath = this.getWorkspacePath();
    console.log("Initializing workspace at", workspacePath);

    try {
      // Check if npm is installed
      await execAsync('npm --version');

      // Initialize npm if needed
      if (!fs.existsSync(path.join(workspacePath, 'package.json'))) {
        await execAsync('npm init -y', { cwd: workspacePath });
      }

      // Check if Aptos CLI is installed
      try {
        await execAsync('aptos --version');
      } catch {
        console.log('Aptos CLI not found. Installing...');
        try {
          await execAsync('python3 --version', { cwd: workspacePath });
        } catch {
          console.log('Python3 is not installed. Installing Python3...');
          await execAsync('sudo apt-get install python3 -y', { cwd: workspacePath, shell: '/bin/bash' });
        }
        await execAsync('curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3', {
          cwd: workspacePath,
          shell: '/bin/bash'
        });
      }

      // Install Aptos dependencies if not installed
      if (!fs.existsSync(path.join(workspacePath, 'node_modules', 'aptos'))) {
        await execAsync('npm install --save-dev aptos', {
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

      // Run aptos move init
      try {
        const { stdout, stderr } = await execAsync('aptos move init --name hello_blockchain --template hello-blockchain', {
          cwd: workspacePath,
          shell: '/bin/bash'
        });

        if (stderr) {
          console.error(`Error during aptos move init: ${stderr}`);
        } else {
          console.log(`Aptos move init completed successfully: ${stdout}`);
        }
      } catch (error) {
        console.error(`Failed to run aptos move init: ${(error as Error).message}`);
      }

      // Run aptos init with predefined answers
      await new Promise<void>((resolve, reject) => {
        const aptosInit = exec('aptos init', { cwd: workspacePath, shell: '/bin/bash' });

        aptosInit.stdout?.on('data', (data) => {
          console.log(data.toString());
          if (data.includes('Aptos already initialized for profile default')) {
            aptosInit.stdin?.write('yes\n');
          } else if (data.includes('Choose network from')) {
            aptosInit.stdin?.write('testnet\n');
          } else if (data.includes('Enter your private key as a hex literal')) {
            aptosInit.stdin?.write('0x...\n'); // Replace '0x...' with your actual private key
          }
        });

        aptosInit.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`aptos init process exited with code ${code}`));
          }
        });
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to initialize workspace: ${(error as Error).message}`);
    }
  }

  public async updateAptosConfig(settings: any) {
    console.log("Updating Aptos config with settings:", settings);
    const workspacePath = this.getWorkspacePath();
    const aptosConfigPath = path.join(workspacePath, 'aptos.config.ts');

    // If the file does not exist, create it
    if (!fs.existsSync(aptosConfigPath)) {
      // Check and install Aptos if needed
      try {
        await execAsync('npm install --save-dev aptos', {
          cwd: workspacePath
        });
      } catch (error) {
        throw new Error('Failed to install Aptos. Please check your npm installation.');
      }
    }

    // Create new config content
    const configContent = `
import { AptosConfig } from "aptos";

const config: AptosConfig = {
  version: "${settings.version}",
  // Add other settings here
};

export default config;
        `;

    // Write the file
    await fs.promises.writeFile(aptosConfigPath, configContent);
  }

  public async getContractFiles(): Promise<string[]> {
    const workspacePath = this.getWorkspacePath();
    const contractsPath = path.join(workspacePath, 'contracts');

    if (!fs.existsSync(contractsPath)) {
      return [];
    }

    const files = await fs.promises.readdir(contractsPath);
    return files.filter(file => file.endsWith('.move'));
  }

  public getPackageDir(): string {
    const settings = this.getSettings();
    return settings.packageDir || {};
  }

  public getNamedAddresses(): string {
    const settings = this.getSettings();
    return settings.addresses || {};
  }

  public async isAptosWorkspace(): Promise<boolean> {
    const workspacePath = this.getWorkspacePath();
    console.log("check workspace", workspacePath);
    try {
      // Check if Aptos is installed
      try {
        await execAsync('npx aptos --version', { cwd: workspacePath });
      } catch {
        return false;
      }

      // Check if aptos.config.ts exists
      const configExists = fs.existsSync(path.join(workspacePath, 'aptos.config.ts'));
      if (!configExists) {
        return false;
      }

      // Check if node_modules/aptos exists
      const nodeModulesExists = fs.existsSync(path.join(workspacePath, 'node_modules', 'aptos'));
      if (!nodeModulesExists) {
        return false;
      }

      // Check if package.json has aptos dependency
      const packageJsonPath = path.join(workspacePath, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        return false;
      }

      const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf8'));
      const hasAptosDep = !!(packageJson.dependencies?.aptos || packageJson.devDependencies?.aptos);

      return hasAptosDep;
    } catch {
      return false;
    }
  }
}