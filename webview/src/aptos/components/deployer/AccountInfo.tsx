import React, { useState, useEffect } from 'react';
import { AptosAccount } from 'aptos';

interface AccountProps {
  namedAddresses: string;
  onChange: (value: string) => void;
  balance: number | null;
}

const AccountAddress: React.FC<AccountProps> = ({ namedAddresses, onChange, balance }) => {
  const [currentAccount, setCurrentAccount] = useState(namedAddresses);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);

  useEffect(() => {
    setCurrentAccount(namedAddresses);
  }, [namedAddresses]);

  const handleConnect = () => {
    const newAccount = new AptosAccount();
    setCurrentAccount(newAccount.address().hex());
    setPublicKey(newAccount.pubKey().hex());
    setPrivateKey(newAccount.toPrivateKeyObject().privateKeyHex);
    console.log('New account created:', newAccount);
  };

  const handleCopyPrivateKey = () => {
    if (privateKey) {
      navigator.clipboard.writeText(privateKey).then(() => {
        alert('Private key copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy private key:', err);
      });
    }
  };

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
            className="mr-2 px-3 py-1 bg-red-500 hover:bg-red-700 text-white text-sm"
          >
            Faucet
          </button>
          <span> Balance: {balance} Move</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={`${currentAccount}`}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
        />
        <button
          className="px-4 py-2 bg-green-500 hover:bg-green-700 text-white rounded-lg transition-colors"
          onClick={handleConnect}
        >
          Connect
        </button>
      </div>

      <div className="mt-4">
        <label className="block text-text-muted text-sm mb-2">Public Key</label>
        <div className='className="flex-1 bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary
               truncate'
        >
          {publicKey || 'No public key available'}
        </div>
        
      </div>

      <div>
        <label className="block text-text-muted text-sm mb-2">Private Key</label>
        <button
          className="w-full bg-background-dark text-text p-4 rounded-lg border border-border"
          onClick={handleCopyPrivateKey}
        >
          Copy Private Key
        </button>
      </div>
    </div>
  );
};

export default AccountAddress;