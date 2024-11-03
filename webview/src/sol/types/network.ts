export interface NetworkConfig {
    name: string;
    url: string;
    accounts: string[];
    chainId: number;
}

export interface NetworkSettingsProps {
    network: NetworkConfig;
    onChange: (network: NetworkConfig) => void;
}
