export interface NetworkSettings {
    name: string;
    url: string;
    accounts: string[];
    chainId: number;
}

export interface DeploymentState {
    environment: 'local' | 'imported';
    network: NetworkSettings;
    selectedContract: string;
    constructorParams: string[];
    deployedContracts: {
        address: string;
        name: string;
        network: string;
    }[];
}
