"use client"

import type React from "react"

import { useState } from "react"
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Here you would typically handle the form submission,
        // e.g., by calling an API or executing the `aptos init` command
        console.log({ network, privateKey, endpoint, faucetEndpoint })
    }

    return (
        <div className="min-h-screen bg-black p-6">
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
                                                {net}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {network !== "custom" && (
                                <div className="space-y-2">
                                    <Label htmlFor="privateKey" className="text-white">
                                        Import Private Key (optional)
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
                                            Endpoint (optional)
                                        </Label>
                                        <Input
                                            id="endpoint"
                                            value={endpoint}
                                            onChange={(e) => setEndpoint(e.target.value)}
                                            className="bg-gray-800 border-gray-700 text-white"
                                            placeholder="Enter custom endpoint"
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
                                            Private Key
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

                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                Init
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

