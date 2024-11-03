export type NetworkEnvironment = 'local' | 'imported';

export interface NetworkConfig {
    name: string;
    url?: string;
    accounts?: string[];
    chainId?: number;
}

export interface ConstructorParam {
    name: string;
    type: string;
    value: string;
}

export interface DeploymentSettings {
    selectedContract: string;
    constructorParams: ConstructorParam[];
    environment: NetworkEnvironment;
    network: NetworkConfig;
} 