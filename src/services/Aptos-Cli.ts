import { exec } from 'child_process';
import * as vscode from 'vscode';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function CheckAptos(): Promise<Boolean> {
    try {
        // Run command "aptos --version"
        const { stdout } = await execAsync("aptos --version");

        // If has output, Aptos has been installed
        if (stdout.trim().length > 0) { return true; }

        // Other case, Aptos has not been installed
        return false;
    } catch (error) {
        return false;
    }
}

export { CheckAptos };