import { useEffect, useState } from "react";
import { OptimizerSettings } from "../../components/compiler/OptimizerSettings";
import { CompilerSettings } from "../../types/settings";
import NamedAddressesInput from "../../components/compiler/NameModule";
import NetworkSelector from "../../components/compiler/Network";
import { Network } from "../../types/network";
import { Button } from "../../components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusDialog } from "../../components/status-dialog";

export default function MoveCompile() {
    const [settings, setSettings] = useState<CompilerSettings>({
        optimizer: {
            enabled: false,
            level: "default",
        },
        metadata: {
            bytecodeHash: "7",
        },
        namedAddresses: "",
        network: Network.Testnet,
    });

    const [compiling, setCompiling] = useState(false);
    const [compileStatus, setCompileStatus] = useState<{
        type: "success" | "error" | null;
        message: string;
    }>({ type: null, message: "" });

    const [showDialog, setShowDialog] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const messageHandler = (event: MessageEvent) => {
            const message = event.data;

            if (message.type === "compileStatus") {
                setCompiling(false);
                setCompileStatus({
                    type: message.success ? "success" : "error",
                    message: message.message,
                });
            } else if (message.type === "cleanStatus") {
                setCompileStatus({
                    type: message.success ? "success" : "error",
                    message: message.message,
                });
            }
        };

        window.addEventListener("message", messageHandler);
        return () => window.removeEventListener("message", messageHandler);
    }, []);

    // useEffect(() => {
    //   if (compileStatus.type) {
    //  setShowDialog(true);
    //   }
    // }, [compileStatus]);

    const handleCompile = async () => {
        setCompiling(true);
        setCompileStatus({ type: null, message: "" });
        setShowDialog(true);
        if (window.vscode) {
            try {
                window.vscode.postMessage({
                    command: "aptos.compile",
                    settings: settings,
                });
            } catch {
                setCompiling(false);
                setCompileStatus({
                    type: "error",
                    message: "Failed to start compilation",
                });
            }
        }
    };

    return (
        <div className="container mx-auto p-4">
            <Card className=" border  border-gray-800 bg-gray-900/50">
                <CardHeader className="border-b border-gray-700 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-600/20">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-blue-500"
                            >
                                <path d="m18 16 4-4-4-4" />
                                <path d="m6 8-4 4 4 4" />
                                <path d="m14.5 4-5 16" />
                            </svg>
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold text-gray-200">
                                Compiler Settings
                            </CardTitle>
                            <p className="text-sm text-gray-400 mt-1">
                                Configure your Move contract compilation options
                            </p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <NetworkSelector
                        network={settings.network || ""}
                        onChange={(value) => setSettings({ ...settings, network: value })}
                    />

                    <NamedAddressesInput
                        namedAddresses={settings.namedAddresses || ""}
                        onChange={(value) =>
                            setSettings({ ...settings, namedAddresses: value })
                        }
                    />

                    <OptimizerSettings
                        enabled={settings.optimizer?.enabled}
                        level={settings.optimizer?.level || ""}
                        onChange={(enabled, level) =>
                            setSettings({
                                ...settings,
                                optimizer: {
                                    enabled,
                                    level: level || settings.optimizer?.level,
                                },
                            })
                        }
                    />

                    <div className="flex justify-between items-center gap-4">
                        <Button
                            variant="outline"
                            className="h-12 flex items-center justify-center gap-2 hover:bg-gray-700"
                            onClick={() => navigate("/aptos/move/help")}
                        >
                            <span>Back</span>
                        </Button>
                        <Button
                            size="lg"
                            onClick={handleCompile}
                            disabled={compiling}
                            className="h-12 px-6 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {compiling ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Compiling...</span>
                                </div>
                            ) : (
                                "Compile"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <StatusDialog
                open={showDialog}
                onOpenChange={setShowDialog}
                loading={compiling}
                status={compileStatus}
                loadingTitle="Compiling..."
                loadingMessage="Please wait while your code is being compiled..."
                successTitle="Compilation Successful"
                errorTitle="Compilation Failed"
                successAction={{
                    label: "Go to Deploy",
                    onClick: () => navigate("/aptos/deployer"),
                }}
            />
        </div>
    );
};

