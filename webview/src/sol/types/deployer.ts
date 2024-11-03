import { ConstructorParam } from './constructor';

export type NetworkType = 'local' | 'testnet' | 'mainnet';

export interface NetworkConfig {
    rpcUrl: string;
    privateKey: string;
}

export interface ContractABI {
    type: string;
    name: string;
    inputs: Array<{
        type: string;
        name: string;
        components?: ContractABI[];
    }>;
    outputs?: Array<{
        type: string;
        name: string;
        components?: ContractABI[];
    }>;
    stateMutability?: string;
}

export interface DeployedContract {
    address: string;
    abi: ContractABI[];
    name: string;
    network: string;
}

export interface DeployerSettings {
    environment: NetworkType;
    network: NetworkConfig;
    gasLimit: number;
    value: string;
    selectedContract: string;
    constructorParams: ConstructorParam[];
    deployedContracts: DeployedContract[];
}
