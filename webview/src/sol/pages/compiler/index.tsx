import { useState, useEffect } from 'react'
import { BasicSettings } from './components/BasicSettings'
import { OptimizerSettings } from './components/OptimizerSettings'
import { AdvancedSettings } from './components/AdvancedSettings'
import { DebugSettings } from './components/DebugSettings'
import { CompilerSettings } from './types/settings'

// Declare vscode API
declare const vscode: {
    postMessage: (message: object) => void;
};

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

    const [workspaceStatus, setWorkspaceStatus] = useState<{
        initialized: boolean;
        loading: boolean;
        error: string | null;
    }>({
        initialized: false,
        loading: false,
        error: null
    });

    // Load saved settings from workspace
    useEffect(() => {
        vscode.postMessage({
            command: 'getSettings'
        });

        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'settings':
                    setSettings(message.settings);
                    break;
                case 'workspaceStatus':
                    setWorkspaceStatus({
                        initialized: message.initialized,
                        loading: message.loading,
                        error: message.error
                    });
                    break;
            }
        });
    }, []);

    useEffect(() => {
        // Lắng nghe message từ extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'compileStatus':
                    setCompiling(false);
                    setCompileStatus({
                        type: message.success ? 'success' : 'error',
                        message: message.message
                    });
                    break;
            }
        });
    }, []);

    const handleCompile = async () => {
        setCompiling(true);
        setCompileStatus({ type: null, message: '' });
        
        vscode.postMessage({
            command: 'updateConfig',
            settings: settings
        });
        
        vscode.postMessage({
            command: 'compile'
        });
    };

    return (
        <div className="flex items-center justify-center w-full h-[calc(100vh-64px)]">
            <div className="w-full h-full bg-background-light border border-border">
                <div className="p-8">
                    {workspaceStatus.loading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            <p className="mt-4 text-text-muted">Initializing workspace...</p>
                        </div>
                    ) : workspaceStatus.error ? (
                        <div className="text-center text-red-500">
                            <p>{workspaceStatus.error}</p>
                            <button 
                                onClick={() => vscode.postMessage({ command: 'initWorkspace' })}
                                className="mt-4 px-4 py-2 bg-primary text-white rounded"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-text text-2xl font-medium">Compiler Settings</h3>
                            <div className="flex items-center gap-4">
                                {compileStatus.type && (
                                    <span className={`text-sm ${
                                        compileStatus.type === 'success' ? 'text-green-500' : 'text-red-500'
                                    }`}>
                                        {compileStatus.message}
                                    </span>
                                )}
                                <button 
                                    onClick={handleCompile}
                                    disabled={compiling}
                                    className={`px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors ${
                                        compiling ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {compiling ? 'Compiling...' : 'Compile'}
                                </button>
                            </div>
                        </div>
                    )}

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
                                optimizer: {
                                    enabled,
                                    runs: runs || settings.optimizer.runs
                                }
                            })}
                        />

                        <AdvancedSettings
                            bytecodeHash={settings.metadata.bytecodeHash}
                            viaIR={settings.viaIR}
                            onChange={(key, value) => {
                                if (key === 'bytecodeHash') {
                                    if (typeof value === 'string') {
                                        setSettings({
                                            ...settings,
                                            metadata: { ...settings.metadata, bytecodeHash: value }
                                        })
                                    }
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