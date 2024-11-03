export type NetworkEnvironment = 'local' | 'imported';

export interface NetworkConfig {
    url?: string;
    accounts?: string[];
    chainId?: number;
}

export interface DeploymentSettings {
    selectedContract: string;
    constructorParams: string[];
    environment: NetworkEnvironment;
    network: NetworkConfig;
} 