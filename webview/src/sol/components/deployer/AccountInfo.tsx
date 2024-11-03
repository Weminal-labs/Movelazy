import { HardhatAccount } from '../../types/account';

interface AccountInfoProps {
    account: string;
    accounts: HardhatAccount[];
    onAccountChange: (account: string) => void;
}

export const AccountInfo = ({ account, accounts, onAccountChange }: AccountInfoProps) => {
    console.log('AccountInfo render:', { account, accounts });
    
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
                        onChange={(e) => {
                            console.log('Account selected:', e.target.value);
                            onAccountChange(e.target.value);
                        }}
                    >
                        <option value="">Select an account...</option>
                        {accounts.map((acc, index) => (
                            <option key={acc.address} value={acc.address}>
                                ({index}) {acc.address} ({acc.balance})
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
                        {accounts.find(acc => acc.address === account)?.balance || '0'} ETH
                    </div>
                </div>
            )}
        </div>
    );
}; 