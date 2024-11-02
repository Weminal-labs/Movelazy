import { useState } from 'react'
import { BasicSettings } from './components/BasicSettings'
import { OptimizerSettings } from './components/OptimizerSettings'
import { AdvancedSettings } from './components/AdvancedSettings'
import { DebugSettings } from './components/DebugSettings'
import { CompilerSettings } from './types/settings'
import { VSCodeApi } from './types/vscode';

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

    const handleCompile = async () => {
        console.log('Compile button clicked');
        console.log('window object:', window);
        console.log('vscode object:', window.vscode);
        console.log('settings:', settings);

        try {
            window.vscode.postMessage({
                command: 'solidity.compile',
                settings: settings
            });
            console.log('Message posted successfully');
        } catch (error) {
            console.error('Error posting message:', error);
        }
    };

    return (
        <div className="flex items-center justify-center w-full h-[calc(100vh-64px)]">
            <div className="w-full h-full bg-background-light border border-border">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-text text-2xl font-medium">Compiler Settings</h3>
                        <div className="flex items-center gap-4">
                            {compileStatus.type && (
                                <span className={`text-sm ${compileStatus.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                    {compileStatus.message}
                                </span>
                            )}
                            <button
                                onClick={handleCompile}
                                disabled={compiling}
                                className={`px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors ${compiling ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {compiling ? 'Compiling...' : 'Compile'}
                            </button>
                        </div>
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
        </div>
    )
}

export default CompilerPage