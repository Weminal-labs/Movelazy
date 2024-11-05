import { DeployedContract, AbiFunction, AbiItem } from '../../types/abi'

interface DeployedContractsProps {
    contracts: DeployedContract[]
}

export const DeployedContracts = ({ contracts }: DeployedContractsProps) => {
    return (
        <div className="space-y-4">
            <h4 className="text-text text-xl font-medium">Deployed Contracts</h4>

            {contracts.length === 0 ? (
                <div className="text-text-muted text-center py-8">
                    No contracts deployed yet
                </div>
            ) : (
                <div className="space-y-4">
                    {contracts.map((contract, index) => (
                        <div
                            key={index}
                            className="bg-background-dark rounded-lg border border-border p-4 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="text-text font-medium">
                                    {contract.name}
                                </div>
                                <button
                                    onClick={() => {/* Copy address */ }}
                                    className="text-text-muted hover:text-text"
                                >
                                    {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
                                </button>
                            </div>

                            <div className="space-y-2">
                                {contract.abi
                                    .filter(isAbiFunction)
                                    .map((func, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-4 p-2 rounded hover:bg-background"
                                        >
                                            <div className="flex-1">
                                                <div className="text-text">
                                                    {func.name}
                                                </div>
                                                <div className="text-text-muted text-sm">
                                                    {func.inputs?.map(input => `${input.type} ${input.name}`).join(', ')}
                                                </div>
                                            </div>

                                            {func.stateMutability === 'view' ? (
                                                <button
                                                    onClick={() => {/* Call view function */ }}
                                                    className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors"
                                                >
                                                    Read
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {/* Call write function */ }}
                                                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded transition-colors"
                                                >
                                                    Write
                                                </button>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// Type guard để kiểm tra function
const isAbiFunction = (item: AbiItem): item is AbiFunction => {
    return item.type === 'function'
} 