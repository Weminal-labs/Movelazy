import { useEffect, useState } from 'react';
import { BasicSettings } from '../../components/compiler/BasicSettings';
import { OptimizerSettings } from '../../components/compiler/OptimizerSettings';
import { AdvancedSettings } from '../../components/compiler/AdvancedSettings';
import { CompilerSettings } from '../../types/settings';
import PackageDirInput from '../../components/compiler/PackageDir';
import NamedAddressesInput from '../../components/compiler/NameModule';
import NetworkSelector from '../../components/compiler/Network';
import { Network } from '../../types/network';

const CompilerPage = () => {
    const [settings, setSettings] = useState<CompilerSettings>({
        version: '4.3.0',
        moveVersion: 'Move 1',
        optimizer: {
            enabled: false,
            level: "default"
        },
        metadata: {
            bytecodeHash: "6"
        },
        packageDir: "",
        namedAddresses: "",
        network: Network.PORTO
    });

    const [compiling, setCompiling] = useState(false);
    const [compileStatus, setCompileStatus] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    }>({ type: null, message: '' });

    const [cleaning, setCleaning] = useState(false);

    useEffect(() => {
        const messageHandler = (event: MessageEvent) => {
            const message = event.data;

            if (message.type === 'compileStatus') {
                setCompiling(false);
                setCompileStatus({
                    type: message.success ? 'success' : 'error',
                    message: message.message
                });
            } else if (message.type === 'cleanStatus') {
                setCleaning(false);
                setCompileStatus({
                    type: message.success ? 'success' : 'error',
                    message: message.message
                });
            }

            // Clear status after 5 seconds
            if (message.type === 'compileStatus' || message.type === 'deployStatus' || message.type === 'cleanStatus') {
                setTimeout(() => {
                    setCompileStatus({ type: null, message: '' });
                }, 5000);
            }
        };

        window.addEventListener('message', messageHandler);
        return () => window.removeEventListener('message', messageHandler);
    }, []);

    const handleCompile = async () => {
        setCompiling(true);
        setCompileStatus({ type: null, message: '' });
        console.log("check settings", settings.packageDir, "  ", settings.namedAddresses);
        if (window.vscode) {
            try {
                window.vscode.postMessage({
                    command: 'aptos.compile',
                    settings: settings
                });
            } catch {
                setCompiling(false);
                setCompileStatus({
                    type: 'error',
                    message: 'Failed to start compilation'
                });
            }
        }
    };

    const handleClean = async () => {
        setCleaning(true);
        setCompileStatus({ type: null, message: '' });
        if (window.vscode) {
            try {
                window.vscode.postMessage({
                    command: 'aptos.clean'
                });
            } catch {
                setCleaning(false);
                setCompileStatus({
                    type: 'error',
                    message: 'Failed to clean artifacts'
                });
            }
        }
    };

    return (
        <div className="flex flex-col w-full h-[calc(100vh-64px)]">
            <div className="flex-1 bg-background-light border border-border">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-text text-2xl font-medium">Compiler Settings</h3>
                        <div className="flex gap-4">
                            <button
                                onClick={handleClean}
                                disabled={cleaning || compiling}
                                className={`px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors ${(cleaning || compiling) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {cleaning ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Cleaning...
                                    </div>
                                ) : 'Clean'}
                            </button>
                            <button
                                onClick={handleCompile}
                                disabled={cleaning || compiling}
                                className={`px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors ${(cleaning || compiling) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {compiling ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Compiling...
                                    </div>
                                ) : 'Compile'}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <PackageDirInput
                            packageDir={settings.packageDir || ''}
                            onChange={(value) => setSettings({ ...settings, packageDir: value })}
                        />

                        <NetworkSelector
                            network={settings.network || ''}
                            onChange={(value) => setSettings({ ...settings, network: value })}
                        />
                        <NamedAddressesInput
                            namedAddresses={settings.namedAddresses || ''}
                            onChange={(value) => setSettings({ ...settings, namedAddresses: value })}
                        />
                        <BasicSettings
                            moveVersion={settings.moveVersion || ''}
                            onChange={(key, value) => setSettings({ ...settings, [key]: value })}
                        />
                        <OptimizerSettings
                            enabled={settings.optimizer?.enabled}
                            level={settings.optimizer?.level || ''}
                            onChange={(enabled, level) => setSettings({
                                ...settings,
                                optimizer: {
                                    enabled,
                                    level: level || settings.optimizer?.level
                                }
                            })}
                        />
                        <AdvancedSettings
                            bytecodeHash={settings.metadata?.bytecodeHash || ''}
                            moveVersion={settings.moveVersion || ''}
                            onChange={(key, value) => {
                                if (key === 'bytecodeHash' && typeof value === 'string') {
                                    setSettings({
                                        ...settings,
                                        metadata: { ...settings.metadata, bytecodeHash: value }
                                    })
                                } else {
                                    setSettings({ ...settings, [key]: value })
                                }
                            }}
                        />

                    </div>
                </div>
            </div>
            {compileStatus.type && (
                <div
                    className={`p-4 border-t border-border transition-all ${compileStatus.type === 'success'
                        ? 'bg-green-500/5 text-green-500 border-green-500/20'
                        : 'bg-red-500/5 text-red-500 border-red-500/20'
                        }`}
                >
                    <pre className="font-mono text-sm whitespace-pre-wrap">
                        {compileStatus.message}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default CompilerPage;