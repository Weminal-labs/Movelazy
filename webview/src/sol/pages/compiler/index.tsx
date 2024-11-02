import { useState, useEffect } from 'react'
import { BasicSettings } from '../../components/compiler/BasicSettings'
import { OptimizerSettings } from '../../components/compiler/OptimizerSettings'
import { AdvancedSettings } from '../../components/compiler/AdvancedSettings'
import { DebugSettings } from '../../components/compiler/DebugSettings'
import { CompilerSettings } from '../../types/settings'
import { VSCodeApi } from '../../types/vscode';

declare global {
    interface Window {
        vscode: VSCodeApi;
    }
}

const CompilerPage = () => {
    const [settings, setSettings] = useState<CompilerSettings>({
        version: '0.8.20',
        evmVersion: 'london',
        optimizer: {
            enabled: false,
            runs: 200
        },
        metadata: {
            bytecodeHash: 'ipfs'
        },
        viaIR: false,
        debug: {
            debugInfo: ['location', 'snippet']
        }
    });

    const [compiling, setCompiling] = useState(false);
    const [compileStatus, setCompileStatus] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    }>({ type: null, message: '' });

    useEffect(() => {
        const messageHandler = (event: MessageEvent) => {
            const message = event.data;

            if (message.type === 'compileStatus') {
                setCompiling(false);
                setCompileStatus({
                    type: message.success ? 'success' : 'error',
                    message: message.message
                });

                // Clear status after 5 seconds
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

        try {
            window.vscode.postMessage({
                command: 'solidity.compile',
                settings: settings
            });
        } catch {
            setCompiling(false);
            setCompileStatus({
                type: 'error',
                message: 'Failed to start compilation'
            });
        }
    };

    return (
        <div className="flex flex-col w-full h-[calc(100vh-64px)]">
            <div className="flex-1 bg-background-light border border-border overflow-y-auto">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-text text-2xl font-medium">Compiler Settings</h3>
                        <button
                            onClick={handleCompile}
                            disabled={compiling}
                            className={`px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors ${compiling ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {compiling ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Compiling...
                                </div>
                            ) : 'Compile'}
                        </button>
                    </div>

                    <div className="space-y-6">
                        <BasicSettings
                            version={settings.version}
                            evmVersion={settings.evmVersion}
                            onChange={(key, value) => setSettings({ ...settings, [key]: value })}
                        />
                        <OptimizerSettings
                            enabled={settings.optimizer.enabled}
                            runs={settings.optimizer.runs}
                            onChange={(enabled, runs) => setSettings({
                                ...settings,
                                optimizer: { enabled, runs: runs || settings.optimizer.runs }
                            })}
                        />
                        <AdvancedSettings
                            bytecodeHash={settings.metadata.bytecodeHash}
                            viaIR={settings.viaIR}
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
                        <DebugSettings
                            debugInfo={settings.debug.debugInfo}
                            onChange={(debugInfo) => setSettings({
                                ...settings,
                                debug: { ...settings.debug, debugInfo }
                            })}
                        />
                    </div>
                </div>
            </div>

            {/* Compilation Status Bar */}
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

export default CompilerPage