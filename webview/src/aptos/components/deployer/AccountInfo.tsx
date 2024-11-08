import React from 'react';

interface AccountProps {
  namedAddresses: string;
  onChange: (value: string) => void;
  balance: number | null;
}

const AccountAddress: React.FC<AccountProps> = ({ namedAddresses, onChange, balance }) => {
  const handleFaucetClick = () => {
    if (window.vscode) {
      window.vscode.postMessage({
        command: 'aptos.requestFaucet',
      });
    }
  };
  return (
    <div className="mb-4">
      <div className='flex flex-row justify-between mb-2'>
        <label className="block text-text-muted text-sm mb-2">Account address</label>
        <div className='flex flex-row items-center'>

          <button
            onClick={handleFaucetClick}
            className="mr-2 px-3 py-1 bg-[#df9331] hover:bg-[#916000] text-white text-sm"
          >
            Faucet
          </button>
          <span> Balance: {balance}Move</span>
        </div>

      </div>
      <div className="flex items-center">
        <input
          type="text"
          value={`0x${namedAddresses}`}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
        />

      </div>
    </div>
  );
};

export default AccountAddress;