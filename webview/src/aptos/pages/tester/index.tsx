import { useEffect, useState } from 'react'
import { FlagsSettings } from '../../components/tester/Flags';

const TesterAptosPage = () => {

    const [flags, setFlags] = useState({
        enabled: false,
        testName: ""
    });

    useEffect(() => {
        const messageHandler = (event: MessageEvent) => {
            const message = event.data;

            if (message.type === 'testerStatus') {
                setTesting(false);
                setTestingStatus({
                    type: message.success ? 'success' : 'error',
                    message: message.message
                });
            }
            // Clear status after 5 seconds
            if (message.type === 'testerStatus' || message.type === 'cleanStatus') {
                setTimeout(() => {
                    setTestingStatus({ type: null, message: '' });
                }, 5000);
            }
        };

        window.addEventListener('message', messageHandler);
        return () => window.removeEventListener('message', messageHandler);
    }, []);

    const [testing, setTesting] = useState(false);
    const [testingStatus, setTestingStatus] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    }>({ type: null, message: '' });

    const handleTester = async () => {
        setTesting(true);
        setTestingStatus({ type: null, message: '' });

        if (window.vscode) {
            try {
                window.vscode.postMessage({
                    command: 'aptos.tester',
                    flags: flags
                });
            } catch {
                setTesting(false);
                setTestingStatus({
                    type: 'error',
                    message: 'Failed to start Testing'
                });
            }
        }
    };
    return (
        <div className="flex flex-col w-full h-[calc(100vh-64px)]">
            <div className="flex-1 bg-background-light border border-border overflow-y-auto">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-text text-2xl font-medium">Tester</h3>
                        <div className="flex gap-4">
                            <button
                                onClick={handleTester}
                                disabled={testing}
                                className={`px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors ${(testing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {testing ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Testing...
                                    </div>
                                ) : 'Tester'}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <FlagsSettings enabled={flags.enabled} onChange={(enabled, testName) => setFlags({ enabled, testName: testName || '' })} />
                    </div>
                </div>
            </div>
            {testingStatus.type && (
                <div
                    className={`p-4 border-t border-border transition-all ${testingStatus.type === 'success'
                        ? 'bg-green-500/5 text-green-500 border-green-500/20'
                        : 'bg-red-500/5 text-red-500 border-red-500/20'
                        }`}
                >
                    <pre className="font-mono text-sm whitespace-pre-wrap">
                        {testingStatus.message}
                    </pre>
                </div>
            )}
        </div>
    )
}

export default TesterAptosPage;