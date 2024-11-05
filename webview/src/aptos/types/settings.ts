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
    nameAddresses?: string,
}

export interface Flags {
    enabled: boolean;
    testName: string;
}