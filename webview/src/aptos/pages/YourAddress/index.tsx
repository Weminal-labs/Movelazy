import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Account, Aptos, AptosConfig, Network, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";
import { AptosAccount } from "aptos";
import NavigateTitle from "../../components/Header";
import InputWallet from "../../components/InputWallet";
import ButtonAccount from "../../components/ButtonAccount";

type Coin = { coin: { value: string } };

const YourAddress = () => {
    const [walletAddress, setWalletAddress] = useState<string>(() => localStorage.getItem('walletAddress') || '');
    const [privatekey, setPrivateKey] = useState<string>(() => localStorage.getItem('privateKey') || '');
    const [publicKey, setPublicKey] = useState<string>(() => localStorage.getItem('publicKey') || '');
    const [balance, setBalance] = useState<string>(() => localStorage.getItem('balance') || '0');

    const createAccount = async () => {
        const aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }));
        try {
            const privateKey = Ed25519PrivateKey.generate();
            const account = Account.fromPrivateKey({ privateKey });
            const address = account.accountAddress;
            const publicKey = account.publicKey;

            await aptos.fundAccount({
                accountAddress: address.toString(),
                amount: 100000000,
            });

            const resource = await aptos.getAccountResource<Coin>({
                accountAddress: account.accountAddress,
                resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
            });

            const balance = resource.coin.value;

            setWalletAddress(address.toString());
            setPrivateKey(privateKey.toString());
            setPublicKey(publicKey.toString());
            setBalance(balance);

            localStorage.setItem('walletAddress', address.toString());
            localStorage.setItem('privateKey', privateKey.toString());
            localStorage.setItem('publicKey', publicKey.toString());
            localStorage.setItem('balance', balance);
        } catch (error) {
            console.error("Error creating account:", error);
        }
    };

    useEffect(() => {
        const savedWalletAddress = localStorage.getItem('walletAddress') || '';
        const savedPrivateKey = localStorage.getItem('privateKey') || '';
        const savedPublicKey = localStorage.getItem('publicKey') || '';

        setWalletAddress(savedWalletAddress);
        setPrivateKey(savedPrivateKey);
        setPublicKey(savedPublicKey);
    }, []);

    const location = useLocation();
    const page = location.state?.page;
    const navigate = useNavigate();
    const handleNavigate = () => {
        navigate(`/${page}`);
    };

    return (
        <div className="text-white h-[300vh] grow overflow-y-scroll">
            <div className="absolute w-[640px] sidebar:w-[400px] h-[766px] top-[-178px] left-[25px]">
                <div className="flex flex-col w-full items-start gap-[20px] absolute top-[228px] left-0">
                    <NavigateTitle handleNavigate={handleNavigate} iconType="aptos" title="Account Aptos" />
                    <div className="flex flex-col gap-[24px] my-5 w-full ">
                        <InputWallet label="Wallet address" value={walletAddress} />
                        <InputWallet label="Private Key" value={privatekey} />
                        <InputWallet label="Public Key" value={publicKey} />
                        <div className="mt-5">
                            <ButtonAccount handleClick={createAccount} span="Create account" />
                            <ButtonAccount handleClick={handleNavigate} span="Account already exist" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default YourAddress;