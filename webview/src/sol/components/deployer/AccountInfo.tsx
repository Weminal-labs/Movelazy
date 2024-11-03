import { HardhatAccount } from '../../types/account';

interface AccountInfoProps {
    account: string;
    accounts: HardhatAccount[];
    onAccountChange: (account: string) => void;
}

const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const AccountInfo = ({ account, accounts, onAccountChange }: AccountInfoProps) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-text-muted text-sm mb-2">
                    Account ({accounts.length} accounts available)
                </label>
                <div className="flex items-center gap-4">
                    <select
                        className="flex-1 bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
                        value={account}
                        onChange={(e) => onAccountChange(e.target.value)}
                        title={account}
                    >
                        <option value="">Select an account...</option>
                        {accounts.map((acc, index) => (
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
                            <span>{accounts.find(acc => acc.address === account)?.balance || '0'}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 