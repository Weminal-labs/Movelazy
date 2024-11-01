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
}
