import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.svg';

interface WorkspaceStatus {
    loading: boolean;
    initialized?: boolean;
    error?: string;
}

const ProjectPage = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<WorkspaceStatus>({ loading: true });

    useEffect(() => {
        const messageHandler = (event: MessageEvent) => {
            const message = event.data;

            switch (message.type) {
                case 'workspaceStatus':
                    setStatus({
                        loading: message.loading,
                        initialized: message.initialized,
                        error: message.error
                    });
                    if (message.initialized && !message.loading) {
                        navigate('/sol/compiler');
                    }
                    break;
            }
        };

        window.addEventListener('message', messageHandler);
        // Check if workspace is a Hardhat project
        window.vscode.postMessage({ command: 'solidity.checkWorkspace' });

        return () => window.removeEventListener('message', messageHandler);
    }, [navigate]);

    const handleInitialize = () => {
        window.vscode.postMessage({ command: 'solidity.initWorkspace' });
    };

    // If workspace is already initialized, show a different message
    if (status.initialized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 text-white">
                <div className="max-w-2xl text-center">
                    <h1 className="text-3xl font-bold mb-6">Hardhat Project Initialized</h1>
                    <p className="text-gray-400 mb-6">
                        Your workspace is already set up for Hardhat development.
                    </p>
                    <button
                        onClick={() => navigate('/sol/compiler')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                    >
                        Go to Compiler
                    </button>
                </div>
            </div>
        );
    }

    // Rest of your existing loading and initialization UI...
    if (status.loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="text-gray-400 mt-4">The initialization process speed base on your PC specs.</p>
                    <p className="text-gray-400 mt-4">This might take a while.</p>
                    <p className="text-gray-400 mt-4">Please don't close this window.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-white">
            <div className="max-w-2xl text-center">
                <div className="flex flex-col items-center">
                    <img src={logo} alt="Logo" className="w-32 h-32" />
                    <h1 className="font-pacifico text-4xl text-white mt-4 mb-8">Movelazy</h1>
                </div>
                <h1 className="text-3xl font-bold mb-6">Movelazy Solidity tool</h1>

                {status.error ? (
                    <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
                        <p className="text-red-400">{status.error}</p>
                    </div>
                ) : (
                    <p className="text-gray-400 mb-6">
                        This workspace is not initialized for Hardhat development.
                        Would you like to set it up now?
                    </p>
                )}

                <button
                    onClick={handleInitialize}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                    Initialize Hardhat Project
                </button>

                <div className="mt-8 text-sm text-gray-500">
                    <p>This will:</p>
                    <ul className="list-disc list-inside mt-2">
                        <li>Initialize a new npm project (if needed)</li>
                        <li>Install Hardhat and required dependencies</li>
                        <li>Create initial project structure</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProjectPage;