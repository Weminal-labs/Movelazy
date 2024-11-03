import { NetworkConfig } from '../../types/settings';

interface NetworkSettingsProps {
    networks: { [key: string]: NetworkConfig };
    onChange: (networks: { [key: string]: NetworkConfig }) => void;
}

export const NetworkSettings = ({ networks, onChange }: NetworkSettingsProps) => {
    const handleNetworkChange = (networkName: string, config: NetworkConfig) => {
        onChange({
            ...networks,
            [networkName]: config
        });
    };

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm">
            <h4 className="text-lg font-medium mb-4">Network Settings</h4>
            <div className="space-y-4">
                {Object.entries(networks).map(([name, config]) => (
                    <div key={name} className="space-y-2">
                        <h5 className="font-medium">{name}</h5>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="RPC URL"
                                value={config.url || ''}
                                onChange={(e) => handleNetworkChange(name, { ...config, url: e.target.value })}
                                className="border rounded p-2"
                            />
                            <input
                                type="number"
                                placeholder="Chain ID"
                                value={config.chainId || ''}
                                onChange={(e) => handleNetworkChange(name, { ...config, chainId: parseInt(e.target.value) })}
                                className="border rounded p-2"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
