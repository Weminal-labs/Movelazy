export interface CompilerSettings {
    version: string;
    moveVersion: string;
    optimizer: {
        enabled: boolean;
        level: string;
    };
    bytecodeHash: string;
    packageDir: string;
    nameAddresses: string;
}
