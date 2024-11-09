import { useEffect, useState } from 'react';
import { DeployerSettings } from '../../../aptos/types/settings';
import NamedAddressesInput from '../../components/deployer/NamedAddresses';
import { AccountInfo } from '../../components/deployer/AccountInfo';

const DeployerPage = () => {
    const [settings, setSettings] = useState<DeployerSettings>({
        nameAddresses: "",
        account: '',
        balance: 0,
    });

    const [accountAddress, setAccountAddress] = useState<string>("");
    const [balance, setBalance] = useState<number | null>(0);
    const [deploying, setDeploying] = useState(false);
    const [deployStatus, setDeployStatus] = useState<{
        type: 'success' | 'error' | null;
        message: string;
        stdout: string;
        stderr: string;
    }>({ type: null, message: '', stdout: '', stderr: '' });

    useEffect(() => {
        const messageHandler = (event: MessageEvent) => {
            const message = event.data;
            console.log("Received message:", message);

            if (message.type === 'deployStatus') {
                setDeploying(false);
                setDeployStatus({
                    type: message.success ? 'success' : 'error',
                    message: message.message,
                    stdout: message.stdout,
                    stderr: message.stderr
                });
            }

            if (message.type === 'accountAddress') {
                console.log("Received account addressasdfasf:", message.address);
                setAccountAddress(message.address);
                console.log("Updated account address:", message.address);
            }

            if (message.type === 'balance') { // Bắt sự kiện balance
                console.log("Received balance:", message.balance);
                setBalance(message.balance / 1e8); // Cập nhật balance
            }
        };


        window.addEventListener('message', messageHandler);
        window.vscode.postMessage({
            command: 'aptos.balance',
        });
        window.vscode.postMessage({
            command: 'aptos.accountAddress',
        });
        return () => window.removeEventListener('message', messageHandler);
    }, []);

    const handleDeploy = async () => {
        if (!settings.nameAddresses) {
            setDeployStatus({
                type: 'error',
                message: 'Named addresses are required.',
                stdout: '',
                stderr: ''
            });
            return;
        }

        setDeploying(true);
        setDeployStatus({ type: null, message: '', stdout: '', stderr: '' });
        console.log("Deploying with named addresses:", settings.nameAddresses);
        if (window.vscode) {
            try {
                window.vscode.postMessage({
                    command: 'aptos.deploy',
                    settings: settings
                });
            } catch {
                setDeploying(false);
                setDeployStatus({
                    type: 'error',
                    message: 'Failed to start deployment',
                    stdout: '',
                    stderr: ''
                });
            }
        }
    };

    return (
        <div className="flex flex-col w-full h-[calc(100vh-64px)]">
            <div className="flex-1 bg-background-light border border-border">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                    <h3 className="text-text text-2xl font-medium">Deploy Settings</h3>
                        <div className="flex gap-4">
                            <button
                                onClick={handleDeploy}
                                disabled={deploying}
                                className={`px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors ${deploying ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {deploying ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Deploying...
                                    </div>
                                ) : 'Deploy'}
                            </button>
                            <a
                                href="https://mizu.testnet.porto.movementnetwork.xyz/" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                                Faucet
                            </a>
                        </div>
                    </div>
                    <div className="mt-2 space-y-6">
                        <AccountAddress
                            namedAddresses={accountAddress || ''}
                            onChange={(value) => {
                                setAccountAddress(value);
                            }}
                            balance={balance}
                        />
                        <NamedAddressesInput
                            namedAddresses={settings.nameAddresses || ''}
                            onChange={(value) => {
                                setSettings({ ...settings, nameAddresses: value });
                            }}
                        />
                        <AccountInfo
                                account={settings.account || ''}
                                balance={settings.balance?.toString() || ''}
                            />
                    </div>
                </div>
                {deployStatus.type && (
                    <div
                        className={`p-4 border-t border-border transition-all ${deployStatus.type === 'success'
                            ? 'bg-green-500/5 text-green-500 border-green-500/20'
                            : 'bg-red-500/5 text-red-500 border-red-500/20'
                            }`}
                    >
                        <pre className="font-mono text-sm whitespace-pre-wrap">
                            {deployStatus.message}
                        </pre>
                    </div>
                )}
                {deployStatus.stdout && (
                    <div className="mb-4">
                        <h4 className="block text-text-muted text-sm mb-2">Deployment Result:</h4>
                        <pre className="font-mono text-sm whitespace-pre-wrap ">
                            {deployStatus.stdout}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeployerPage;