import { useState, useEffect } from 'react'
import { EnvironmentSelector } from '../../components/deployer/EnvironmentSelector'
import { AccountInfo } from '../../components/deployer/AccountInfo'
import { NetworkSettings } from '../../components/deployer/NetworkSettings'
import { HardhatAccount } from '../../types/account'
import { DeploymentState } from '../../types/deployment'

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
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    useEffect(() => {
        // Request accounts only once when component mounts
        window.vscode.postMessage({ command: 'solidity.startLocalNode' });
    }, []); // Empty dependency array means this runs once on mount

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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeployerPage; 