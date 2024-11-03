import { useState, useEffect } from 'react'
import { EnvironmentSelector } from '../../components/deployer/EnvironmentSelector'
import { AccountInfo } from '../../components/deployer/AccountInfo'
import { GasSettings } from '../../components/deployer/GasSettings'
import { ContractDeployer } from '../../components/deployer/ContractDeployer'
import { DeployedContracts } from '../../components/deployer/DeployedContracts'
import { AbiItem } from '../../types/abi'
import { ConstructorParam } from '../../types/constructor'
import { HardhatAccount } from '../../types/account'

interface DeployerState {
    environment: 'local' | 'testnet' | 'mainnet'
    network: {
        rpcUrl: string
        privateKey: string
    }
    account: string
    balance: string
    gasLimit: number
    value: string
    selectedContract: string
    constructorParams: ConstructorParam[]
    deployedContracts: {
        address: string
        abi: AbiItem[]
        name: string
        network: string
    }[]
}

const DeployerPage = () => {
    const [settings, setSettings] = useState<DeployerState>({
        environment: 'local',
        network: {
            rpcUrl: '',
            privateKey: ''
        },
        account: '',
        balance: '0',
        gasLimit: 3000000,
        value: '0',
        selectedContract: '',
        constructorParams: [],
        deployedContracts: []
    });

    const [accounts, setAccounts] = useState<HardhatAccount[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [contracts, setContracts] = useState<string[]>([]);

    // Check if workspace is initialized
    useEffect(() => {
        window.vscode.postMessage({
            command: 'solidity.checkWorkspace'
        });
    }, []);

    // Get contract files when workspace is ready
    useEffect(() => {
        window.vscode.postMessage({
            command: 'solidity.getContractFiles'
        });
    }, []);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            console.log('DeployerPage received message:', message);
            
            switch (message.type) {
                case 'accounts':
                    console.log('Setting accounts:', message.accounts);
                    setAccounts(message.accounts);
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    useEffect(() => {
        if (settings.environment === 'local') {
            console.log('Starting local node...');
            window.vscode.postMessage({ command: 'solidity.startLocalNode' });
        }
    }, [settings.environment]);

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
                                onChange={(env) => setSettings({
                                    ...settings,
                                    environment: env,
                                    network: { rpcUrl: '', privateKey: '' }
                                })}
                            />

                            <AccountInfo
                                account={selectedAccount}
                                accounts={accounts}
                                onAccountChange={setSelectedAccount}
                            />

                            <GasSettings
                                gasLimit={settings.gasLimit}
                                value={settings.value}
                                onChange={(key, value) => setSettings({
                                    ...settings,
                                    [key]: value
                                })}
                            />

                            {/* <ContractDeployer
                                selectedContract={settings.selectedContract}
                                constructorParams={settings.constructorParams}
                                onChange={(contract, params) => setSettings({
                                    ...settings,
                                    selectedContract: contract,
                                    constructorParams: params
                                })}
                                onDeploy={() => {
                                    window.vscode.postMessage({
                                        command: 'solidity.deploy',
                                        settings: settings
                                    });
                                }}
                                disabled={loading ||
                                    (settings.environment !== 'local' &&
                                        (!settings.network.rpcUrl || !settings.network.privateKey))}
                            /> */}

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