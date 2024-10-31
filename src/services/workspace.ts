import * as vscode from 'vscode';
import { glob } from 'glob';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface CompilerSettings {
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
}

export class WorkspaceService {
  private workspacePath: string;

  constructor() {
    if (vscode.workspace.workspaceFolders?.[0]) {
      this.workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    } else {
      throw new Error('No workspace folder found');
    }
  }

  async fileExists(path: string): Promise<boolean> {
    try {
      await readFile(path);
      return true;
    } catch {
      return false;
    }
  }

  async createDefaultConfig(): Promise<void> {
    const configContent = `
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 31337
    }
  }
};

export default config;`;

    await writeFile(
      join(this.workspacePath, 'hardhat.config.ts'),
      configContent
    );
  }

  async getContracts(): Promise<string[]> {
    const pattern = join(this.workspacePath, 'contracts/**/*.sol');
    return glob(pattern);
  }

  async updateHardhatConfig(settings: CompilerSettings): Promise<void> {
    const configContent = `
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";

const config: HardhatUserConfig = {
  solidity: {
    version: "${settings.version}",
    settings: {
      optimizer: {
        enabled: ${settings.optimizer.enabled},
        runs: ${settings.optimizer.runs}
      },
      evmVersion: "${settings.evmVersion}",
      metadata: {
        bytecodeHash: "${settings.metadata.bytecodeHash}"
      },
      viaIR: ${settings.viaIR},
      debug: {
        debugInfo: ${JSON.stringify(settings.debug.debugInfo)}
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    }
  }
};

export default config;`;

    await writeFile(
      join(this.workspacePath, 'hardhat.config.ts'),
      configContent
    );
  }
}
