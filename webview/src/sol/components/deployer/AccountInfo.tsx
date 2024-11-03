import { HardhatAccount } from '../../types/account';
import { useEffect } from 'react';

interface AccountInfoProps {
    account: string;
    accounts: HardhatAccount[];
    onAccountChange: (account: string) => void;
}

const STORAGE_KEY = 'hardhat_accounts';

const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const AccountInfo = ({ account, accounts, onAccountChange }: AccountInfoProps) => {
    useEffect(() => {
        // If we receive new accounts from hardhat node, store them
        if (accounts.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
        }
    }, [accounts]);

    // Get accounts from storage if none provided
    const displayAccounts = accounts.length > 0 
        ? accounts 
        : JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-text-muted text-sm mb-2">
                    Account ({displayAccounts.length} accounts available)
                </label>
                <div className="flex items-center gap-4">
                    <select
                        className="flex-1 bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
                        value={account}
                        onChange={(e) => onAccountChange(e.target.value)}
                        title={account}
                    >
                        <option value="">Select an account...</option>
                        {displayAccounts.map((acc: HardhatAccount, index: number) => (
                            <option 
                                key={acc.address} 
                                value={acc.address}
                                title={`${acc.address} (${acc.balance})`}
                            >
                                ({index}) {shortenAddress(acc.address)} ({acc.balance})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {account && (
                <div>
                    <label className="block text-text-muted text-sm mb-2">
                        Balance
                    </label>
                    <div className="w-full bg-background-dark text-text p-4 rounded-lg border border-border">
                        <div className="flex justify-between items-center">
                            <span title={account} className="truncate">
                                {shortenAddress(account)}
                            </span>
                            <span>{displayAccounts.find((acc: HardhatAccount) => acc.address === account)?.balance || '0'}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 