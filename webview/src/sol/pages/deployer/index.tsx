import { useState, useEffect } from 'react'
import { EnvironmentSelector } from '../../components/deployer/EnvironmentSelector'
import { AccountInfo } from '../../components/deployer/AccountInfo'
import { NetworkSettings } from '../../components/deployer/NetworkSettings'
import { HardhatAccount } from '../../types/account'
import { DeploymentState } from '../../types/deployment'
import { Select } from '../../components/ui/select'

const DeployerPage = () => {
    const [settings, setSettings] = useState<DeploymentState>({
        environment: 'local',
        network: {
            name: 'hardhat',
            url: 'http://127.0.0.1:8545',
            accounts: [],
            chainId: 1337
        },
        selectedContract: '',
        constructorParams: [],
        deployedContracts: []
    });

    const [accounts, setAccounts] = useState<HardhatAccount[]>([]);
    const [contractNames, setContractNames] = useState<string[]>([]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            switch (message.type) {
                case 'accounts':
                    setAccounts(message.accounts);
                    if (message.accounts.length > 0) {
                        setSettings(prev => ({
                            ...prev,
                            network: {
                                ...prev.network,
                                accounts: [message.accounts[0].privateKey]
                            }
                        }));
                    }
                    break;
                case 'compiledContracts':
                    setContractNames(message.contracts);
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    useEffect(() => {
        window.vscode.postMessage({ command: 'solidity.startLocalNode' });
        window.vscode.postMessage({ command: 'solidity.getCompiledContracts' });
    }, []);

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col">
            <div className="flex-1 overflow-auto bg-background-light">
                <div className="min-h-full w-full border border-border">
                    <div className="p-8 space-y-6">
                        <EnvironmentSelector
                            environment={settings.environment}
                            onChange={(env) => setSettings({
                                ...settings,
                                environment: env,
                                network: env === 'local' ? {
                                    name: 'hardhat',
                                    url: 'http://127.0.0.1:8545',
                                    accounts: settings.network.accounts,
                                    chainId: 1337
                                } : {
                                    name: '',
                                    url: '',
                                    accounts: [],
                                    chainId: 1
                                }
                            })}
                        />

                        {settings.environment === 'local' ? (
                            <AccountInfo
                                accounts={accounts}
                                selectedPrivateKey={settings.network.accounts[0]}
                                onAccountSelect={(account) => setSettings({
                                    ...settings,
                                    network: {
                                        ...settings.network,
                                        accounts: [account.privateKey]
                                    }
                                })}
                            />
                        ) : (
                            <NetworkSettings
                                network={settings.network}
                                onChange={(network) => setSettings({
                                    ...settings,
                                    network
                                })}
                            />
                        )}

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-text">Select Compiled Contract</h3>
                            <Select
                                value={settings.selectedContract}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    selectedContract: e.target.value
                                })}
                            >
                                <option value="">Select a contract</option>
                                {contractNames.map(name => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                            </Select>
                            {settings.selectedContract && (
                                <p className="text-sm text-text-light">
                                    Selected contract: {settings.selectedContract}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeployerPage; 