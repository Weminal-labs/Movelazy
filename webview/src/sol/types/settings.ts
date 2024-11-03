export interface NetworkConfig {
    url?: string;
    accounts?: string[];
    chainId?: number;
}

export interface HardhatConfig {
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
        [key: string]: NetworkConfig;
    };
    namedAccounts?: {
        deployer: {
            default: number;
        };
    };
}
