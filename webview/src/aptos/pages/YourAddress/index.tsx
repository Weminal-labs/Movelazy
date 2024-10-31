import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Account, Aptos, AptosConfig, Network, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";
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

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col">
          <div className="flex-1 overflow-auto bg-background-light">
            <div className="min-h-full w-full border border-border">
               <div className="flex justify-between items-center mb-8">
                        <h3 className="text-text text-2xl font-medium">YourAddress</h3>
                      </div>
                    <div className="flex flex-col gap-[24px] my-5 w-full ">
                        <InputWallet label="Wallet address" value={walletAddress} />
                        <InputWallet label="Private Key" value={privatekey} />
                        <InputWallet label="Public Key" value={publicKey} />
                        <div className="mt-5">
                            <ButtonAccount handleClick={createAccount} span="Create account" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default YourAddress;