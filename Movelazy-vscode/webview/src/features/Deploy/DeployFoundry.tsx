/* eslint-disable @typescript-eslint/ban-ts-comment */
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import FileUpload from "../../components/FileUpload";
import DeployButton from '../../components/DeployButton';
import InputWallet from '../../components/InputWallet';
import NavigateTitle from '../../components/Header';

const DeployFoundry = () => {
    //@ts-ignore
    const [privatekey, setPrivateKey] = useState<string>(() => localStorage.getItem('privateKey') || '');
    const [deploymentInfo, setDeploymentInfo] = useState('');

    const [loading, setLoading] = useState(false); // For button loading state
    const [apiError, setApiError] = useState('');  // To show any API errors

    const [file, setFile] = useState<File | null>(null);
    //@ts-ignore
    const [fileName, setFileName] = useState<string | null>(null);

    const [transactionHash, setTransactionHash] = useState<string | null>(null);

    const [selectedNetwork, setSelectedNetwork] = useState<string>('https://mevm.devnet.imola.movementlabs.xyz');

    const getTransactionHash = (response: string): string | null => {
        // Tìm dòng chứa Transaction hash
        const lines = response.split('\n');
        for (const line of lines) {
            if (line.startsWith('Transaction hash:')) {
                // Trả về giá trị sau dấu hai chấm
                return line.split(': ')[1].trim();
            }
        }
        return null; // Nếu không tìm thấy Transaction hash
    };

    const location = useLocation();
    const page = location.state?.page;
    const handleNetworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedNetwork(e.target.value);
        console.log(e.target.value);
    };

    const handleDeploy = async () => {
        setLoading(true);
        setApiError('');
        setDeploymentInfo('');

        const url = 'http://3.26.212.161:3000/upload/solidity';

        try {
            const formData = new FormData();
            if (file) {
                formData.append('file', file);
            } else {
                throw new Error('No file selected for upload');
            }
            formData.append('privateKey', privatekey);
            formData.append('rpcUrl', selectedNetwork);

            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log("Deployment successful:", response.data);
            console.log(getTransactionHash(response.data));
            setTransactionHash(getTransactionHash(response.data));
            setDeploymentInfo(response.data);
            alert(`Deployment successful:\n${response.data}`);
        } catch (error) {
            console.error('Error during deployment:', error);

            if (axios.isAxiosError(error)) {
                setApiError(error.response?.data || 'Failed to deploy');
            } else {
                setApiError('An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const navigate = useNavigate();
    const handleNavigate = () => {
        navigate(`/${page}`);
    };

    return (
        <>
            <div className="flex flex-wrap h-[300vh] grow overflow-y-scroll ">
                <div className="absolute w-[640px] sidebar:w-[400px] h-[766px] top-[-178px] left-[25px]">
                    <div className="flex flex-col w-full items-start gap-[20px] absolute top-[228px] left-0">
                        <NavigateTitle handleNavigate={handleNavigate} iconType="foundry" title="Deploy Foundry" />
                        <div className="flex flex-col gap-[24px] my-5 w-full ">
                            <div>
                                <FileUpload file={file} setFile={setFile} page={page} setFileName={setFileName} />
                            </div>
                            <div>
                                <InputWallet
                                    label="Private Key"
                                    value={privatekey}
                                />
                            </div>
                            <div>

                                <label htmlFor="network" className="block text-xl text-white font-semibold mb-2 ">
                                    Select Network
                                </label>
                                <select
                                    id="network"
                                    value={selectedNetwork}
                                    onChange={handleNetworkChange}
                                    className="w-full px-5 py-4 text-black border border-[#5a5a5a] text-[20px] rounded-lg bg-white"
                                >
                                    <option value="" disabled>Select a network</option>
                                    <option value="https://mevm.devnet.imola.movementlabs.xyz" className="bg-white text-[20px] text-black">
                                        https://mevm.devnet.imola.movementlabs.xyz
                                    </option>
                                </select>

                            </div>
                            <div className="mt-5">
                                <DeployButton handleDeploy={handleDeploy} loading={loading} apiError={apiError} />
                            </div>

                            {deploymentInfo && (
                                <>
                                    <div className="mt-4 p-4 bg-gray-800 text-white rounded-lg ">
                                        <h3 className="text-lg font-semibold">Deployment Info:</h3>
                                        <pre className="whitespace-pre-wrap break-words ">{deploymentInfo}</pre>
                                    </div>
                                    <a
                                        href={`https://explorer.devnet.imola.movementnetwork.xyz/#/txn/${transactionHash}`}
                                        className=" w-full px-5 py-4 mt-4 text-white text-center text-[18px] rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
                                    >
                                        Explore
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DeployFoundry;