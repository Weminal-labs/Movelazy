import { useState, useEffect } from 'react'
import { EnvironmentSelector } from '../../components/deployer/EnvironmentSelector'
import { AccountInfo } from '../../components/deployer/AccountInfo'
import { NetworkSettings } from '../../components/deployer/NetworkSettings'
import { ContractDeployer } from '../../components/deployer/ContractDeployer'
import { DeployedContracts } from '../../components/deployer/DeployedContracts'
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
    const [loading, setLoading] = useState(false);

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
                case 'deployStatus':
                    setLoading(false);
                    if (message.success) {
                        const address = message.message.match(/Contract deployed to: (.+)/)?.[1];
                        if (address) {
                            setSettings(prev => ({
                                ...prev,
                                deployedContracts: [...prev.deployedContracts, {
                                    address,
                                    name: prev.selectedContract,
                                    network: prev.environment === 'local' ? 'hardhat' : prev.network.name
                                }]
                            }));
                        }
                    }
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    useEffect(() => {
        if (settings.environment === 'local') {
            window.vscode.postMessage({ command: 'solidity.startLocalNode' });
        } else {
            window.vscode.postMessage({ command: 'solidity.stopLocalNode' });
        }
    }, [settings.environment]);

    const handleDeploy = () => {
        setLoading(true);
        window.vscode.postMessage({
            command: 'solidity.deploy',
            settings: {
                selectedContract: settings.selectedContract,
                constructorParams: settings.constructorParams,
                environment: settings.environment,
                network: settings.network
            }
        });
    };

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

                        <ContractDeployer
                            selectedContract={settings.selectedContract}
                            constructorParams={settings.constructorParams}
                            onChange={(contract, params) => setSettings({
                                ...settings,
                                selectedContract: contract,
                                constructorParams: params
                            })}
                            onDeploy={handleDeploy}
                            disabled={loading || !settings.selectedContract || 
                                (settings.environment === 'imported' && 
                                (!settings.network.url || !settings.network.accounts.length))}
                        />

                        <DeployedContracts
                            contracts={settings.deployedContracts}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeployerPage; 