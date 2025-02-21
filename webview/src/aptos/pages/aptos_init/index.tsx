"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"

export default function AptosInitForm() {
    const [network, setNetwork] = useState<string>("devnet")
    const [privateKey, setPrivateKey] = useState<string>("")
    const [endpoint, setEndpoint] = useState<string>("")
    const [faucetEndpoint, setFaucetEndpoint] = useState<string>("")

    const [initInfo, setInitInfo] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        window.vscode.postMessage({
            command: "aptos.init",
            initConfig: [network, endpoint, faucetEndpoint, privateKey]
        })
    }

    useEffect(() => {
        const messageHandler = (event: MessageEvent) => {
            const message = event.data

            if (message.type === "CliStatus") {
                if (message.initInfo) {
                    setInitInfo(message.initInfo);
                }
            }
        }

        window.addEventListener("message", messageHandler)
        return () => window.removeEventListener("message", messageHandler)
    }, []);

    // Disable the submit button if 'endpoint' is required and not filled in when custom network is selected
    const isSubmitDisabled = network === "custom" && !endpoint;

    return (
        <div className="min-h-screen bg-black">
            <div className="mx-auto max-w-2xl">
                <Card className="border-gray-800 bg-gray-900/50">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-white">Aptos Init Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="network" className="text-white">
                                    Choose Network
                                </Label>
                                <Select onValueChange={setNetwork} defaultValue={network}>
                                    <SelectTrigger id="network" className="bg-gray-800 border-gray-700 text-white">
                                        <SelectValue placeholder="Select network" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-700">
                                        {["devnet", "testnet", "mainnet", "local", "custom"].map((net) => (
                                            <SelectItem key={net} value={net} className="text-white hover:bg-gray-700">
                                                {net.toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {network !== "custom" && (
                                <div className="space-y-2">
                                    <Label htmlFor="privateKey" className="text-white">
                                        Private Key (None: Auto generate new key-pair)
                                    </Label>
                                    <Input
                                        id="privateKey"
                                        type="password"
                                        value={privateKey}
                                        onChange={(e) => setPrivateKey(e.target.value)}
                                        className="bg-gray-800 border-gray-700 text-white"
                                        placeholder="Enter your private key"
                                    />
                                </div>
                            )}

                            {network === "custom" && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="endpoint" className="text-white">
                                            Endpoint (required)
                                        </Label>
                                        <Input
                                            id="endpoint"
                                            value={endpoint}
                                            onChange={(e) => setEndpoint(e.target.value)}
                                            className="bg-gray-800 border-gray-700 text-white"
                                            placeholder="Enter custom endpoint"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="faucetEndpoint" className="text-white">
                                            Faucet Endpoint (optional)
                                        </Label>
                                        <Input
                                            id="faucetEndpoint"
                                            value={faucetEndpoint}
                                            onChange={(e) => setFaucetEndpoint(e.target.value)}
                                            className="bg-gray-800 border-gray-700 text-white"
                                            placeholder="Enter custom faucet endpoint"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customPrivateKey" className="text-white">
                                            Private Key (None: Auto generate new key-pair)
                                        </Label>
                                        <Input
                                            id="customPrivateKey"
                                            type="password"
                                            value={privateKey}
                                            onChange={(e) => setPrivateKey(e.target.value)}
                                            className="bg-gray-800 border-gray-700 text-white"
                                            placeholder="Enter your private key"
                                        />
                                    </div>
                                </>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={isSubmitDisabled}  // Disable button if endpoint is empty and network is custom
                            >
                                Init
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
