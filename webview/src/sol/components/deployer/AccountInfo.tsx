import { AccountInfoProps } from '../../types/account';

export const AccountInfo = ({ accounts, selectedPrivateKey, onAccountSelect }: AccountInfoProps) => {
    return (
        <div className="p-4 bg-background rounded-lg border border-border">
            <h4 className="text-lg font-medium mb-4">Local Accounts</h4>
            <div className="space-y-2">
                {accounts.map((account) => (
                    <div 
                        key={account.address}
                        className={`p-3 border rounded-md cursor-pointer ${
                            account.privateKey === selectedPrivateKey ? 'border-primary' : 'border-border'
                        }`}
                        onClick={() => onAccountSelect(account)}
                    >
                        <div className="flex justify-between items-center">
                            <div className="truncate">
                                <p className="font-medium">Address: {account.address}</p>
                                <p className="text-sm">Balance: {account.balance}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 