import { useState, useEffect } from 'react';
import { AptosAccount } from 'aptos';

interface AccountInfoProps {
  account: string;
}

export const AccountInfo = ({ account }: AccountInfoProps) => {
  const [currentAccount, setCurrentAccount] = useState(account);
  const [balance, setBalance] = useState<string | null>(null);

  const handleConnect = () => {
    const newAccount = new AptosAccount();
    setCurrentAccount(newAccount.address().hex());
    console.log('New account created:', newAccount);
  };

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch(`https://fullnode.devnet.aptoslabs.com/v1/accounts/${currentAccount}/resources`);
        const data = await response.json();
        const accountResource = data.find((resource: any) => resource.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>');
        if (accountResource) {
          setBalance(accountResource.data.coin.value);
        } else {
          setBalance('0');
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance('Error');
      }
    };

    if (currentAccount) {
      fetchBalance();
    }
  }, [currentAccount]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-text-muted text-sm mb-2">
          Account
        </label>
        <div className="flex items-center gap-4">
          <select 
            className="flex-1 bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
            value={currentAccount}
            disabled
          >
            <option value="">{currentAccount || 'No account loaded...'}</option>
          </select>
          <button 
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
            onClick={handleConnect}
          >
            Connect
          </button>
        </div>
      </div>

      <div>
        <label className="block text-text-muted text-sm mb-2">
          Balance
        </label>
        <div className="w-full bg-background-dark text-text p-4 rounded-lg border border-border">
          {balance !== null ? balance : 'Loading...'}
        </div>
      </div>
    </div>
  );
} 