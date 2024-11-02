import { useState } from 'react'
import { EnvironmentSelector } from '../../components/deployer/EnvironmentSelector'
import { AccountInfo } from '../../components/deployer/AccountInfo'
import { GasSettings } from '../../components/deployer/GasSettings'
import { ContractDeployer } from '../../components/deployer/ContractDeployer'
import { DeployedContracts } from '../../components/deployer/DeployedContracts'
import { AbiItem } from '../../types/abi'
import { ConstructorParam } from '../../types/constructor'

interface DeployerState {
    environment: 'vm' | 'injected' | 'web3' | 'custom'
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
    }[]
}

const DeployerPage = () => {
    const [settings, setSettings] = useState<DeployerState>({
        environment: 'vm',
        account: '',
        balance: '0',
        gasLimit: 3000000,
        value: '0',
        selectedContract: '',
        constructorParams: [],
        deployedContracts: []
    })

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
                                onChange={(env) => setSettings({ ...settings, environment: env })}
                            />

                            <AccountInfo
                                account={settings.account}
                                balance={settings.balance}
                            />

                            <GasSettings
                                gasLimit={settings.gasLimit}
                                value={settings.value}
                                onChange={(key, value) => setSettings({ ...settings, [key]: value })}
                            />

                            <ContractDeployer
                                selectedContract={settings.selectedContract}
                                constructorParams={settings.constructorParams}
                                onChange={(contract, params) => setSettings({
                                    ...settings,
                                    selectedContract: contract,
                                    constructorParams: params
                                })}
                            />

                            <DeployedContracts
                                contracts={settings.deployedContracts}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DeployerPage 