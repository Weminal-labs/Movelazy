"use client";

import { ExternalLink, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Separator } from "../../components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { StatusDialog } from "../../components/status-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

export default function MoveDeploy() {
  const navigate = useNavigate();
  const [deploying, setDeploying] = useState(false);
  const [network, setNetwork] = useState("");
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [transactionLink, setTransactionLink] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [cliStatus, setcliStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: "success", message: "" });
  const [deployArgs, setDeployArgs] = useState({
    overrideSizeCheck: false,
    chunkedPublish: false,
    largePackagesModuleAddress:
      "0x0e1ca3011bdd07246d4d16d909dbb2d6953a86c4735d5acf5865d962c630cce7",
    chunkSize: "55000",
    includedArtifacts: "sparse",
    packageDir_deploy: "",
    outputDir_deploy: "",
    namedAddresses_deploy: "",
    overrideStd_deploy: "",
    skipGitDeps_deploy: false,
    skipAttributeChecks_deploy: false,
    checkTestCode_deploy: false,
    optimize: "default",
    bytecodeVersion: "7",
    compilerVersion: "2.0",
    languageVersion: "2.1",
    senderAccount: "",
    privateKey_deploy: "",
    encoding: "hex",
    gasUnitPrice: "100",
    maxGas: "100",
    expirationSecs: "30",
    assume_yes: false,
    assume_no: false,
    local: false,
    benmark: false,
  });

  const handleChange = (
    field: keyof typeof deployArgs,
    value: string | boolean
  ) => {
    setDeployArgs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const messageHandler = useCallback(
    (event: MessageEvent) => {
      const message = event.data;

      if (message.type === "profileStatus") {
        console.log("Network Status:", message.data);
        setNetwork(message.message.network);
        setAccount(message.message.accountAddress);
        setBalance(message.message.balance);

        setBalance((message.message.balance / (10 * 8)).toString());
      }

      if (message.type === "cliStatus") {
        setDeploying(false);
        console.log("checktype:", message.type);
        const transactionLinkMatch = message.message.match(
          /Transaction submitted:\s*(https:\/\/[^ ]+)/
        );
        const transactionLink = transactionLinkMatch
          ? transactionLinkMatch[1]
          : "";

        console.log("transactionLink:", transactionLink);
        setcliStatus({
          type: message.success ? "success" : "error",
          message: message.message,
        });
        console.log("check cli mess", cliStatus);
        setTransactionLink(transactionLink);
      }
    },
    [account, network, balance, transactionLink]
  );

  useEffect(() => {
    console.log("check run");
    window.vscode.postMessage({ command: "aptos.checkProfile" });
    window.addEventListener("message", messageHandler);
    return () => window.removeEventListener("message", messageHandler);
  }, [messageHandler]);

  const handleDeploy = async () => {
    setDeploying(true);
    setcliStatus({ type: null, message: "" });
    setShowDialog(true);
    if (window.vscode) {
      try {
        window.vscode.postMessage({
          command: "aptos.deploy",
          deployArgs: [
            deployArgs.overrideSizeCheck,
            deployArgs.chunkedPublish,
            deployArgs.largePackagesModuleAddress,
            deployArgs.chunkSize,
            deployArgs.includedArtifacts,
            deployArgs.packageDir_deploy,
            deployArgs.outputDir_deploy,
            deployArgs.namedAddresses_deploy,
            deployArgs.overrideStd_deploy,
            deployArgs.skipGitDeps_deploy,
            deployArgs.skipAttributeChecks_deploy,
            deployArgs.checkTestCode_deploy,
            deployArgs.optimize,
            deployArgs.bytecodeVersion,
            deployArgs.compilerVersion,
            deployArgs.languageVersion,
            deployArgs.senderAccount,
            deployArgs.privateKey_deploy,
            deployArgs.encoding,
            deployArgs.gasUnitPrice,
            deployArgs.maxGas,
            deployArgs.expirationSecs,
          ],
        });
      } catch {
        setDeploying(false);
        setcliStatus({
          type: "error",
          message: "Failed to start deployment",
        });
      }
    }
  };

  const truncateAddress = (address: string) => {
    if (!address) return "";
    if (address.length < 8) return address;
    return `${address.slice(0, 10)}...${address.slice(-10)}`;
  };

  return (
    <div>
      <Card className="min-h-screen border-gray-800 bg-gray-900/50">
        <Button
          variant="outline"
          className="h-12 flex items-center justify-center gap-2 hover:bg-gray-700 mt-2 ml-2"
          onClick={() => navigate("/aptos/move/help")}
        >
          <span>Back</span>
        </Button>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">
            Deploy Contract
          </CardTitle>
        </CardHeader>
        <Card className="bg-gray-800 border-gray-700 max-w-sm mx-auto mb-4">
          <CardContent className="p-3 space-y-1.5 ">
            <div className="flex justify-start items-center ">
              <span className="text-sm text-gray-400">Network:</span>
              <Badge
                variant={network ? "default" : "secondary"}
                className="font-medium text-sm border-none"
              >
                {network || "Not Connected"}
              </Badge>
            </div>
            {account && (
              <div className="flex justify-start items-center ">
                <span className="text-sm text-gray-400">Account:</span>
                <Badge
                  variant="outline"
                  className="font-medium text-sm border-none"
                >
                  0x{truncateAddress(account)}
                </Badge>
              </div>
            )}
            {balance !== null && (
              <div className="flex justify-start items-center border-none">
                <span className="text-sm text-gray-400">Balance:</span>
                <Badge
                  variant="outline"
                  className="font-medium text-sm border-none"
                >
                  {balance} APT
                </Badge>
              </div>
            )}
            {network?.toLowerCase().includes("testnet") && account && (
              <div className="flex justify-center">
                <Button
                  variant="link"
                  className="text-xs text-blue-400 hover:text-blue-300 p-0 h-auto"
                  asChild
                >
                  <a
                    href={`https://aptos.dev/en/network/faucet?address=${account}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get testnet tokens <ExternalLink className="w-2 h-2 ml-1" />
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <CardContent>
          <Tabs defaultValue="simple" className="mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 mb-6">
              <TabsTrigger value="simple">Simple</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="namedAddresses" className="text-white">
                  Named Addresses (required)
                </Label>
                <Input
                  id="namedAddresses"
                  value={deployArgs.namedAddresses_deploy}
                  onChange={(e) =>
                    handleChange("namedAddresses_deploy", e.target.value)
                  }
                  placeholder="e.g. alice=0x1234, bob=0x5678"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gasUnitPrice" className="text-white">
                  Gas Unit Price
                </Label>
                <Input
                  id="gasUnitPrice"
                  type="number"
                  value={deployArgs.gasUnitPrice}
                  onChange={(e) =>
                    handleChange(
                      "gasUnitPrice",
                      Math.max(100, Number.parseInt(e.target.value)).toString()
                    )
                  }
                  placeholder="Gas unit price (min 100)"
                  className="bg-gray-800 border-gray-700 text-white"
                  min="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxGas" className="text-white">
                  Max Gas
                </Label>
                <Input
                  id="maxGas"
                  type="number"
                  value={deployArgs.maxGas}
                  onChange={(e) =>
                    handleChange(
                      "maxGas",
                      Math.max(100, Number.parseInt(e.target.value)).toString()
                    )
                  }
                  placeholder="Maximum gas (min 100)"
                  className="bg-gray-800 border-gray-700 text-white"
                  min="100"
                />
              </div>
            </div>

            <TabsContent value="advanced">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Override Size Check</Label>
                    <div className="text-sm text-gray-400">
                      Override the check for maximal size of published data
                    </div>
                  </div>
                  <Switch
                    checked={deployArgs.overrideSizeCheck}
                    onCheckedChange={(checked) =>
                      handleChange("overrideSizeCheck", checked)
                    }
                    className="bg-white"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Chunked Publish</Label>
                    <div className="text-sm text-gray-400">
                      Publish package in chunked mode for large packages
                    </div>
                  </div>
                  <Switch
                    checked={deployArgs.chunkedPublish}
                    onCheckedChange={(checked) =>
                      handleChange("chunkedPublish", checked)
                    }
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Chunk Size</Label>
                  <Input
                    value={deployArgs.chunkSize}
                    onChange={(e) => handleChange("chunkSize", e.target.value)}
                    placeholder="Size of code chunk in bytes"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Included Artifacts</Label>
                  <Select
                    value={deployArgs.includedArtifacts}
                    onValueChange={(value) =>
                      handleChange("includedArtifacts", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select artifacts" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="sparse">Sparse</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="bg-gray-800" />

                <div className="space-y-2">
                  <Label>Sender Account</Label>
                  <Input
                    value={deployArgs.senderAccount}
                    onChange={(e) =>
                      handleChange("senderAccount", e.target.value)
                    }
                    placeholder="Sender account address"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Private Key</Label>
                  <Input
                    type="password"
                    value={deployArgs.privateKey_deploy}
                    onChange={(e) =>
                      handleChange("privateKey_deploy", e.target.value)
                    }
                    placeholder="Signing Ed25519 private key"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Expiration (seconds)</Label>
                  <Input
                    value={deployArgs.expirationSecs}
                    onChange={(e) =>
                      handleChange("expirationSecs", e.target.value)
                    }
                    placeholder="Transaction expiration in seconds"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Assume Yes</Label>
                  <Switch
                    checked={deployArgs.assume_yes}
                    onCheckedChange={(checked) =>
                      handleChange("assume_yes", checked)
                    }
                    className="bg-white"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Assume No</Label>
                  <Switch
                    checked={deployArgs.assume_no}
                    onCheckedChange={(checked) =>
                      handleChange("assume_no", checked)
                    }
                    className="bg-white"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Local</Label>
                  <Switch
                    checked={deployArgs.local}
                    onCheckedChange={(checked) =>
                      handleChange("local", checked)
                    }
                    className="bg-white"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Benchmark</Label>
                  <Switch
                    checked={deployArgs.benmark}
                    onCheckedChange={(checked) =>
                      handleChange("benmark", checked)
                    }
                    className="bg-white"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleDeploy}
            disabled={deploying}
          >
            {deploying ? <Loader2 className="animate-spin" /> : "Deploy"}
          </Button>
        </CardContent>
      </Card>

      <StatusDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        loading={deploying}
        status={cliStatus}
        loadingTitle="Deploying..."
        loadingMessage="Please wait while deploying contract..."
        successTitle="Deployment Successful"
        errorTitle="Deployment Failed"
        link={{ label: "View on Explore", transactionLink: transactionLink }}
      />
    </div>
  );
}
