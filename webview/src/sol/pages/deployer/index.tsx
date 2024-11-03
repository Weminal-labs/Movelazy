import { useState, useEffect } from 'react';
import { EnvironmentSelector } from '../../components/deployer/EnvironmentSelector';
import { AccountInfo } from '../../components/deployer/AccountInfo';
import { NetworkConfig } from '../../components/deployer/NetworkConfig';
import { GasSettings } from '../../components/deployer/GasSettings';
import { ContractDeployer } from '../../components/deployer/ContractDeployer';
import { DeployedContracts } from '../../components/deployer/DeployedContracts';
import { HardhatAccount } from '../../types/account';
import { DeployerSettings, NetworkType } from '../../types/deployer';
import { ConstructorParam } from '../../types/constructor';

const DeployerPage = () => {
    const [settings, setSettings] = useState<DeployerSettings>({
        environment: 'local',
        network: {
            rpcUrl: '',
            privateKey: ''
        },
        gasLimit: 3000000,
        value: '0',
        selectedContract: '',
        constructorParams: [],
        deployedContracts: []
    });

    const [accounts, setAccounts] = useState<HardhatAccount[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            switch (message.type) {
                case 'accounts':
                    setAccounts(message.accounts);
                    break;
                case 'deployStatus':
                    setLoading(false);
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    useEffect(() => {
        if (settings.environment === 'local') {
            const storedAccounts = localStorage.getItem('hardhat_accounts');
            if (!storedAccounts) {
                window.vscode.postMessage({ command: 'solidity.startLocalNode' });
            } else {
                setAccounts(JSON.parse(storedAccounts));
            }
            // Clear network config when switching to local
            setSettings(prev => ({
                ...prev,
                network: { rpcUrl: '', privateKey: '' }
            }));
        } else {
            setSelectedAccount('');
        }
    }, [settings.environment]);

    useEffect(() => {
        if (settings.environment === 'local' && selectedAccount) {
            const account = accounts.find(acc => acc.address === selectedAccount);
            if (account) {
                setSettings(prev => ({
                    ...prev,
                    network: {
                        rpcUrl: 'http://127.0.0.1:8545',
                        privateKey: account.privateKey || ''
                    }
                }));
            }
        }
    }, [settings.environment, selectedAccount, accounts]);

    const handleEnvironmentChange = (environment: NetworkType) => {
        setSettings(prev => ({ ...prev, environment }));
    };

    const handleNetworkChange = (network: { rpcUrl: string; privateKey: string }) => {
        setSettings(prev => ({ ...prev, network }));
    };

    const handleConstructorParamsChange = (contract: string, params: ConstructorParam[]) => {
        setSettings(prev => ({
            ...prev,
            selectedContract: contract,
            constructorParams: params
        }));
    };

    const handleDeploy = () => {
        setLoading(true);
        window.vscode.postMessage({
            command: 'solidity.deploy',
            settings: {
                environment: settings.environment,
                network: settings.network,
                gasLimit: settings.gasLimit,
                value: settings.value,
                selectedContract: settings.selectedContract,
                constructorParams: settings.constructorParams.map(param => param.value)
            }
        });
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col">
            <div className="flex-1 overflow-auto bg-background-light">
                <div className="min-h-full w-full border border-border">
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-text text-2xl font-medium">
                                Deploy & Run Transactions
                            </h3>
                        </div>

                        <div className="space-y-6">
                            <EnvironmentSelector
                                environment={settings.environment}
                                onChange={handleEnvironmentChange}
                            />

                            {settings.environment === 'local' ? (
                                <AccountInfo
                                    account={selectedAccount}
                                    accounts={accounts}
                                    onAccountChange={setSelectedAccount}
                                />
                            ) : (
                                <NetworkConfig
                                    network={settings.network}
                                    onChange={handleNetworkChange}
                                />
                            )}

                            <GasSettings
                                gasLimit={settings.gasLimit}
                                value={settings.value}
                                onChange={(key, value) => setSettings(prev => ({
                                    ...prev,
                                    [key]: value
                                }))}
                            />

                            <ContractDeployer
                                selectedContract={settings.selectedContract}
                                constructorParams={settings.constructorParams}
                                onChange={handleConstructorParamsChange}
                                onDeploy={handleDeploy}
                                disabled={loading || !settings.network.privateKey || !settings.network.rpcUrl}
                            />

                            <DeployedContracts
                                contracts={settings.deployedContracts}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeployerPage; 