/* eslint-disable @typescript-eslint/ban-ts-comment */
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import FileUpload from "../FileUpload";
import NavigateTitle from '../Header';
import InputWallet from '../InputWallet';
import DeployButton from '../DeployButton';

const DeployAptos = () => {
    //@ts-ignore
    const [privatekey, setPrivateKey] = useState<string>(() => localStorage.getItem('privateKey') || '');
    const [deploymentInfo, setDeploymentInfo] = useState('');

    const [loading, setLoading] = useState(false); // For button loading state
    const [apiError, setApiError] = useState('');  // To show any API errors

    const [file, setFile] = useState<File | null>(null);
    //@ts-ignore
    const [fileName, setFileName] = useState<string | null>(null);
    //@ts-ignore
    const [modName, setModName] = useState('');

    const [transactionHash, setTransactionHash] = useState<string | null>(null);

    const [maxGas, setMaxGas] = useState<number | ''>(1000);
    const [gasUnitPrice, setGasUnitPrice] = useState<number | ''>(1);

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
    //@ts-ignore
    const handleModName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setModName(e.target.value);
    }

    const handleMaxGasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMaxGas(value === '' ? '' : Number(value)); // Convert to number or keep as empty string
    };

    const handleGasUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setGasUnitPrice(value === '' ? '' : Number(value)); // Convert to number or keep as empty string
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
                        <NavigateTitle handleNavigate={handleNavigate} iconType="aptos" title="Deploy Aptos" />
                        <div className="flex flex-col gap-[24px] my-5 w-full ">
                            <div>
                                <FileUpload file={file} setFile={setFile} page={page} setFileName={setFileName} />
                            </div>
                            <div className=''>
                                <InputWallet
                                    label="Module Name"
                                    value={privatekey}
                                />
                            </div>
                            <div>
                                <InputWallet
                                    label="Private Key"
                                    value={privatekey}
                                />
                            </div>
                            <div>
                                <label
                                    className=" block text-white text-xl font-semibold mb-2 "
                                >Max Gas</label>
                                <input
                                    type="number"
                                    placeholder="Max Gas"
                                    value={maxGas}
                                    onChange={handleMaxGasChange}
                                    className="w-full peer outline-none ring px-4 py-3 h-12 text-[20px] text-black border-0 rounded-lg ring-gray-200 duration-500 focus:ring-2 focus:border-gray-100 relative placeholder:duration-500 placeholder:absolute focus:placeholder:pt-10 shadow-xl shadow-gray-400/10 focus:shadow-none focus:rounded-md focus:ring-[#15ba42] placeholder:text-gray-400"
                                    max={1000000000}
                                />
                            </div>

                            <div className=''>
                                <label
                                    className=" block text-white text-xl font-semibold mb-2 "
                                >Gas Unit Price</label>
                                <input
                                    type="number"
                                    placeholder="Gas Unit Price"
                                    value={gasUnitPrice}
                                    onChange={handleGasUnitPriceChange}
                                    className="w-full peer outline-none ring px-4 py-3 h-12 text-[20px] text-black border-0 rounded-lg ring-gray-200 duration-500 focus:ring-2 focus:border-gray-100 relative placeholder:duration-500 placeholder:absolute focus:placeholder:pt-10 shadow-xl shadow-gray-400/10 focus:shadow-none focus:rounded-md focus:ring-[#15ba42] placeholder:text-gray-400"
                                    max={1000}
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
                                    className="w-full px-5 py-4 text-black text-[20px] border border-[#5a5a5a] rounded-lg bg-white"
                                >
                                    <option value="https://aptos.testnet.suzuka.movementlabs.xyz/v1" className="bg-white text-[20px] text-black">
                                        https://aptos.testnet.suzuka.movementlabs.xyz/v1
                                    </option>
                                    <option value="https://devnet.suzuka.movementnetwork.xyz/v1" className="bg-white text-[20px] text-black">
                                        https://devnet.suzuka.movementnetwork.xyz/v1
                                    </option>
                                </select>
                            </div>
                            <div className="mt-5">
                                <DeployButton handleDeploy={handleDeploy} loading={loading} apiError={apiError} />
                            </div>

                            {deploymentInfo && (
                                <div className="mt-4 p-4 bg-gray-800 text-white rounded-lg ">
                                    <h3 className="text-lg font-semibold">Deployment Info:</h3>
                                    <pre className="whitespace-pre-wrap break-words ">{deploymentInfo}</pre>

                                </div>
                            )}
                            {deploymentInfo && (
                                <a
                                    href={`https://explorer.movementnetwork.xyz/txn/${transactionHash}`}
                                    className=" w-full px-5 py-4 mt-4 text-white text-center text-[18px] rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
                                >
                                    Explore
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}

export default DeployAptos;