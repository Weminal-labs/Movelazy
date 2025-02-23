"use client";

import type React from "react";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { StatusDialog } from "../../components/status-dialog";

export default function AptosInitForm() {
  const navigate = useNavigate();

  const [network, setNetwork] = useState<string>("devnet");
  const [privateKey, setPrivateKey] = useState<string>("");
  const [endpoint, setEndpoint] = useState<string>("");
  const [faucetEndpoint, setFaucetEndpoint] = useState<string>("");

  const [initStatus, setInitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [showDialog, setShowDialog] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setInitializing(true);
    if (window.vscode) {
      try {
        window.vscode.postMessage({
          command: "aptos.init",
          initConfig: [network, endpoint, faucetEndpoint, privateKey],
        });
      } catch (error) {
        console.error(error);
        setInitializing(false);
        setInitStatus({
          type: "error",
          message: "Failed to initialize config",
        });
        setShowDialog(true);
      }
    }
  };

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === "initStatus") {
        if (message.initInfo) {
          setInitStatus({
            type: message.success ? "success" : "error",
            message: message.initInfo,
          });
          setInitializing(false);
          setShowDialog(true);
        }
      }
    };

    window.addEventListener("message", messageHandler);
    return () => window.removeEventListener("message", messageHandler);
  }, []);

  // Disable the submit button if 'endpoint' is required and not filled in when custom network is selected

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-2xl">
        <Card className="min-h-screen border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">
              Aptos Init Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="network" className="text-white">
                  Choose Network
                </Label>
                <Select onValueChange={setNetwork} defaultValue={network}>
                  <SelectTrigger
                    id="network"
                    className="bg-gray-800 border-gray-700 text-white"
                  >
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {["devnet", "testnet", "mainnet", "local", "custom"].map(
                      (net) => (
                        <SelectItem
                          key={net}
                          value={net}
                          className="text-white hover:bg-gray-700"
                        >
                          {net.toUpperCase()}
                        </SelectItem>
                      )
                    )}
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-4"
              >
                Init
              </Button>
              <Button
                onClick={() => navigate("/aptos/help")}
                variant="outline"
                className="w-full bg-grey-600 hover:bg-red-700 text-white"
              >
                Back
              </Button>
            </form>
          </CardContent>
        </Card>
        <StatusDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          loading={initializing}
          status={initStatus}
          loadingTitle="Initializing..."
          loadingMessage="Please wait while initializing config..."
          successTitle="Initialization Successful"
          errorTitle="Initialization Failed"
          successAction={{
            label: "Go to init",
            onClick: () => navigate("/aptos/move/init"),
          }}
        />
      </div>
    </div>
  );
}
