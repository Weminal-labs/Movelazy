import React from 'react';
import { OrbitProgress } from "react-loading-indicators";

interface DeployButtonProps {
    handleDeploy: () => Promise<void>;
    loading: boolean;
    apiError: string | null;
}


const DeployButton: React.FC<DeployButtonProps> = ({ handleDeploy, loading, apiError }) => {
    return (
        <div>
            <button
                className={`relative w-full mt-2 inline-flex items-center text-xl justify-center px-4 py-3 mb-2 me-2 overflow-hidden font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800 ${loading ? 'bg-white' : 'bg-blue-500'}`}
                onClick={handleDeploy}
                disabled={loading}
            >
                {loading ? (
                    <OrbitProgress color="#7d9cd9" size="small" text="Loading..." textColor="" />
                ) : (
                    'Deploy'
                )}
            </button>
            {apiError && <p className="text-red-500 mt-2">{apiError}</p>}
        </div>
    );
};

export default DeployButton;
