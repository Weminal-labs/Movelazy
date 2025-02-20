import React from "react";
import { Network } from "../../types/network";

interface NetworkSelectorProps {
  network: string;
  onChange: (network: Network) => void;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  network,
  onChange,
}) => {
  const handleNetworkChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as Network);
  };

  return (
    <div>
      <label className="block text-text-muted text-sm mb-2">
        Select Network
      </label>
      <select
        id="network-select"
        value={network}
        onChange={handleNetworkChange}
        className="w-full bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
      >
        <option value={Network.Testnet}>Testnet</option>
        <option value={Network.Devnet}>Devnet</option>
      </select>
    </div>
  );
};

export default NetworkSelector;
