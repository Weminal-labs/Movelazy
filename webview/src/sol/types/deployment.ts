import { ConstructorParam } from './contract';

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
    constructorParams: ConstructorParam[];
    deployedContracts: {
        address: string;
        name: string;
        network: string;
    }[];
}
