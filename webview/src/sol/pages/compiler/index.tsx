import { useState } from 'react'
import { BasicSettings } from './components/BasicSettings'
import { OptimizerSettings } from './components/OptimizerSettings'
import { AdvancedSettings } from './components/AdvancedSettings'
import { DebugSettings } from './components/DebugSettings'

const CompilerPage = () => {
    const [settings, setSettings] = useState({
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
    })

    return (
        <div className="flex items-center justify-center w-full h-[calc(100vh-64px)]">
            <div className="w-full h-full bg-background-light border border-border">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-text text-2xl font-medium">Compiler Settings</h3>
                        <button className="px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors">
                            Compile
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