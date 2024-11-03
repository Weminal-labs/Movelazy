interface NetworkConfigProps {
    network: {
        rpcUrl: string;
        privateKey: string;
    };
    onChange: (network: { rpcUrl: string; privateKey: string }) => void;
}

export const NetworkConfig = ({ network, onChange }: NetworkConfigProps) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-text-muted text-sm mb-2">
                    Network RPC URL
                </label>
                <input
                    type="text"
                    value={network.rpcUrl}
                    onChange={(e) => onChange({ ...network, rpcUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
                />
            </div>
            <div>
                <label className="block text-text-muted text-sm mb-2">
                    Private Key
                </label>
                <input
                    type="password"
                    value={network.privateKey}
                    onChange={(e) => onChange({ ...network, privateKey: e.target.value })}
                    placeholder="Enter your wallet's private key"
                    className="w-full bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
                />
            </div>
        </div>
    );
};
