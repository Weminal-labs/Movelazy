import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { execAsync } from "../../utils/execAsync";

export class WorkspaceService {
  private readonly stateKey = "compiler.settings";

  constructor(private context: vscode.ExtensionContext) {}

  private getWorkspacePath(): string {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      throw new Error("No workspace folder found");
    }
    return workspaceFolders[0].uri.fsPath;
  }

  public async saveSettings(settings: any) {
    console.log("Saving settings:", settings);
    await this.context.workspaceState.update(this.stateKey, settings);
  }

  public getSettings(): any {
    const settings = this.context.workspaceState.get(this.stateKey, {
      optimizer: {
        enabled: false,
        level: "default",
      },
      metadata: {
        bytecodeHash: "6",
      },
      packageDir: "",
      namedAddresses: "",
      network: "https://api.testnet.aptoslabs.com/v1",
    });

    console.log("Retrieved settings:", settings);
    return settings;
  }

  public async initializeWorkspace() {
    const workspacePath = this.getWorkspacePath();
    console.log("Initializing workspace at", workspacePath);

    try {
      // Check if npm is installed
      await execAsync("npm --version");

      // Initialize npm if needed
      // if (!fs.existsSync(path.join(workspacePath, "package.json"))) {
      //   await execAsync("npm init -y", { cwd: workspacePath });
      // }

      // Check and install Aptos CLI if needed
      const isAptosCLIReady = await this.checkAndInstallAptosCLI();
      if (!isAptosCLIReady) {
        throw new Error(
          "Failed to install Aptos CLI. Please check the logs for details."
        );
      }

      // Install Aptos dependencies if not installed
      // if (!fs.existsSync(path.join(workspacePath, "node_modules", "aptos"))) {
      //   await execAsync("npm install --save-dev aptos", { cwd: workspacePath });
      // }

      // Create tsconfig.json if it doesn't exist
      // const tsconfigPath = path.join(workspacePath, "tsconfig.json");
      // if (!fs.existsSync(tsconfigPath)) {
      //   const tsconfigContent = {
      //     compilerOptions: {
      //       module: "NodeNext",
      //       moduleResolution: "NodeNext",
      //       target: "es2020",
      //       outDir: "dist",
      //       rootDir: "./",
      //       strict: true,
      //       esModuleInterop: true,
      //       forceConsistentCasingInFileNames: true,
      //     },
      //   };
      //   await fs.promises.writeFile(tsconfigPath, JSON.stringify(tsconfigContent, null, 2));
      // }

      // Run aptos move init
      const moveTomlPath = path.join(workspacePath, "Move.toml");
      if (!fs.existsSync(moveTomlPath)) {
        try {
          const { stdout, stderr } = await execAsync(
            "aptos move init --name hello_blockchain --template hello-blockchain",
            { cwd: workspacePath, shell: "/bin/bash" }
          );

          if (stderr) {
            console.error(`Error during aptos move init: ${stderr}`);
            return false;
          } else {
            console.log(`Aptos move init completed successfully: ${stdout}`);
          }
        } catch (error) {
          throw new Error(
            `Failed to run aptos move init: ${(error as Error).message}`
          );
        }
      } else {
        console.log("Move.toml already exists, skipping aptos move init.");
      }

      return true;
    } catch (error) {
      console.error(
        `Error initializing workspace: ${(error as Error).message}`
      );
      return false;
    }
  }

  private async checkAndInstallAptosCLI(): Promise<boolean> {
    try {
      await execAsync("aptos --version");
      console.log("Aptos CLI is already installed.");
      return true;
    } catch {
      console.log("Aptos CLI not found. Installing...");

      try {
        // Ensure Python3 is installed
        await this.checkAndInstallPython3();

        // Install Aptos CLI using Python script
        await execAsync(
          'curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3',
          { shell: "/bin/bash" }
        );
        console.log("Aptos CLI installed successfully via Python script.");

        // Add Aptos CLI to PATH
        const aptosPath = `${process.env.HOME}/.aptos/bin`;
        console.log("aptosPath", aptosPath);
        if (!process.env.PATH?.includes(aptosPath)) {
          console.log("Adding Aptos CLI to PATH...");
          const shellConfigFile = process.env.SHELL?.includes("zsh")
            ? "~/.zshrc"
            : "~/.bashrc";

          try {
            await fs.promises.appendFile(
              shellConfigFile,
              `\nexport PATH="${aptosPath}:$PATH"\n`
            );
            console.log(
              `Aptos CLI added to PATH in ${shellConfigFile}. Please reload your shell.`
            );
          } catch (error) {
            console.error(
              `Failed to add Aptos CLI to PATH: ${(error as Error).message}`
            );
            return false;
          }
        }

        // Verify Aptos CLI
        await execAsync("aptos --version");
        console.log("Aptos CLI is now available.");
        return true;
      } catch (error) {
        console.error(
          `Failed to install Aptos CLI: ${(error as Error).message}`
        );
        return false;
      }
    }
  }

  private async checkAndInstallPython3(): Promise<void> {
    try {
      await execAsync("python3 --version");
      console.log("Python3 is already installed.");
    } catch {
      console.log("Python3 is not installed. Installing...");
      const osType = process.platform;
      if (osType === "linux") {
        await execAsync(
          "sudo apt-get update && sudo apt-get install -y python3",
          { shell: "/bin/bash" }
        );
      } else if (osType === "darwin") {
        await execAsync("brew install python3");
      } else {
        throw new Error(
          "Unsupported operating system. Please install Python3 manually."
        );
      }
    }
  }

  public async getContractFiles(): Promise<string[]> {
    const workspacePath = this.getWorkspacePath();
    const contractsPath = path.join(workspacePath, "contracts");

    if (!fs.existsSync(contractsPath)) {
      return [];
    }

    const files = await fs.promises.readdir(contractsPath);
    return files.filter((file) => file.endsWith(".move"));
  }

  public getPackageDir(): string {
    const settings = this.getSettings();
    return settings.packageDir || {};
  }

  public getNamedAddresses(): string {
    const settings = this.getSettings();
    return settings.namedAddresses || {};
  }

  public async isAptosWorkspace(): Promise<boolean> {
    const workspacePath = this.getWorkspacePath();
    console.log("check workspace", workspacePath);
    try {
      // Check if Aptos is installed
      try {
        await execAsync("npx aptos --version", { cwd: workspacePath });
      } catch {
        return false;
      }

      // Check if aptos.config.ts exists
      const configExists = fs.existsSync(
        path.join(workspacePath, "aptos.config.ts")
      );
      if (!configExists) {
        return false;
      }

      // Check if node_modules/aptos exists
      const nodeModulesExists = fs.existsSync(
        path.join(workspacePath, "node_modules", "aptos")
      );
      if (!nodeModulesExists) {
        return false;
      }

      // Check if package.json has aptos dependency
      const packageJsonPath = path.join(workspacePath, "package.json");
      if (!fs.existsSync(packageJsonPath)) {
        return false;
      }

      const packageJson = JSON.parse(
        await fs.promises.readFile(packageJsonPath, "utf8")
      );
      const hasAptosDep = !!(
        packageJson.dependencies?.aptos || packageJson.devDependencies?.aptos
      );

      return hasAptosDep;
    } catch {
      return false;
    }
  }
}
