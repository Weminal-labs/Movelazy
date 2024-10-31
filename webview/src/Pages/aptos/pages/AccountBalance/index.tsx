/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import NavigateTitle from "../../components/Header";
const AccountBalance = () => {
    //@ts-ignore
    const [walletAddress, setWalletAddress] = useState<string>(() => localStorage.getItem('walletAddress') || '');


    const [balance, setBalance] = useState<string>(() => localStorage.getItem('balance') || '0');

    useEffect(() => {
        const getBalance = async (address: string) => {
            if (page === 'foundry') {
                const provider = ethers.getDefaultProvider("https://mevm.devnet.imola.movementlabs.xyz");
                if (!address) return; // Nếu địa chỉ không tồn tại, không làm gì cả
                try {
                    const balance = await provider.getBalance(address);
                    const balanceMove = ethers.formatUnits(balance, 18);
                    setBalance(balanceMove.toString());
                } catch (error) {
                    console.error('Lỗi khi lấy số dư:', error);
                }
            };
        }
        getBalance(walletAddress);
    },);

    const location = useLocation();
    const page = location.state?.page;
    const navigate = useNavigate();
    const handleNavigate = () => {
        navigate(`/${page}`);
    };

    return (
        <>
            <div className="h-[300vh] grow overflow-y-scroll">
                <div className="absolute w-[640px] sidebar:w-[400px] h-[766px] top-[-178px] left-[25px]">
                    <div className="flex flex-col w-full items-start gap-[20px] absolute top-[228px] left-0">
                        <NavigateTitle handleNavigate={handleNavigate} iconType={page === 'foundry' || page === 'aptos' ? page : 'foundry'} title={`Account Balance ${page}`} />


                        <div className="flex flex-col gap-[24px] my-5 w-full ">
                            <div>
                                <label htmlFor="coin"
                                    className=" block text-xl text-white font-semibold mb-2"
                                >Asset Type</label>
                                <input
                                    className={`w-full px-5 py-4 text-[#8f8f8f] text-[20px] border border-[#5a5a5a] rounded-lg bg-white `}
                                    type="text"
                                    value="Coin"
                                    disabled
                                />
                            </div>

                            <div>
                                <label htmlFor="coin"
                                    className=" block text-xl text-white font-semibold mb-2"
                                >Coin Type</label>
                                <div
                                    className="w-full px-5 py-4 text-[#272727] text-[20px] border-2 border-[#5a5a5a] rounded-lg bg-white"
                                >
                                    {page === 'aptos' ? "Octas" : "ETH"}
                                </div>
                            </div>
                            <div >
                                <label
                                    className=" block text-white text-xl font-semibold mb-2 "
                                >Balance</label>
                                <input
                                    className={`w-full px-5 py-4 text-[#8f8f8f] text-[20px] border border-[#5a5a5a] rounded-lg bg-white `}
                                    type="text"
                                    max={10000000000}
                                    value={balance}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div className=" bg-blue-500 text-white font-bold py-2 px-4 rounded  cursor-pointer self-end"
                    onClick={() => { navigate("/deploy") }}>
                    Deploy
                </div>
            </div>
        </>
    );
}
export default AccountBalance;