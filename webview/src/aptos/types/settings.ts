export interface CompilerSettings {
    version: string;
    evmVersion?: string;
    moveVersion?: string;
    optimizer: {
        enabled: boolean;
        runs?: number;
        level?: string;
    };
    metadata?: {
        bytecodeHash: string;
    };
    viaIR?: boolean;
    debug?: {
        debugInfo: string[];
    };

    packageDir?: string,
    namedAddresses?: string,
}

export interface DeployerSettings {
    version: string;
    evmVersion?: string;
    moveVersion?: string;
    optimizer: {
        enabled: boolean;
        runs?: number;
        level?: string;
    };
    metadata?: {
        bytecodeHash: string;
    };
    viaIR?: boolean;
    debug?: {
        debugInfo: string[];
    };

    packageDir: string;
    namedAddresses: string;
}

export interface Flags {
    enabled: boolean;
    testName: string;
}

// Example function to log settings
export function logCompilerSettings(settings: CompilerSettings) {
    console.log("CompilerSettings:", settings);
}

export function logDeployerSettings(settings: DeployerSettings) {
    console.log("DeployerSettings:", settings);
}

export function logFlags(flags: Flags) {
    console.log("Flags:", flags);
}