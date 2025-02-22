import { ArrowLeft, Loader2 } from "lucide-react";
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
import { useEffect, useState } from "react";
import { StatusDialog } from "../../components/status-dialog";

// interface CompileArgs {
//   namedAddresses: string;
//   template: string;
//   artifacts: "none" | "sparse" | "all";
//   optimization: "none" | "default" | "extra";
//   saveMetadata: boolean;
//   devMode: boolean;
//   skipGitDeps: boolean;
//   skipAttributeChecks: boolean;
//   checkTestCode: boolean;
//   packageDir: string;
//   outputDir: string;
//   fetchDepsOnly: boolean;
//   overrideStd: "mainnet" | "testnet" | "devnet" | null;
// }

export default function MoveCompile() {
  const navigate = useNavigate();
  const [compiling, setCompiling] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [compileStatus, setCompileStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: "success", message: "" });
  const [compileArgs, setCompileArgs] = useState({
    saveMetadata: false,
    fetchDepsOnly: false,
    artifacts: "sparse",
    packageDir_compile: "",
    outputDir: "",
    namedAddresses_compile: "",
    overrideStd: "",
    devMode: false,
    skipGitDeps: false,
    skipAttributeChecks: false,
    checkTestCode: false,
    optimization: "default",
  });

  const handleChange = (
    field: keyof typeof compileArgs,
    value: string | boolean | null
  ) => {
    setCompileArgs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const messageHandler = (event: MessageEvent) => {
    const message = event.data;

    if (message.type === "compileStatus") {
      setCompiling(false);
      setCompileStatus({
        type: message.success ? "success" : "error",
        message: message.message,
      });
    }
  };

  useEffect(() => {
    window.addEventListener("message", messageHandler);
    return () => window.removeEventListener("message", messageHandler);
  }, []);

  const handleCompile = async () => {
    setCompiling(true);
    setCompileStatus({ type: null, message: "" });
    setShowDialog(true);
    if (window.vscode) {
      try {
        console.log("check compile agrs:", compileArgs);
        window.vscode.postMessage({
          command: "aptos.compile",
          compileArgs: [
            compileArgs.saveMetadata,
            compileArgs.fetchDepsOnly,
            compileArgs.artifacts,
            compileArgs.packageDir_compile,
            compileArgs.outputDir,
            compileArgs.namedAddresses_compile,
            compileArgs.overrideStd,
            compileArgs.devMode,
            compileArgs.skipGitDeps,
            compileArgs.skipAttributeChecks,
            compileArgs.checkTestCode,
            compileArgs.optimization,
          ],
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

  // useEffect(() => {
  //   if (compileStatus.type) {
  //     setShowDialog(true);
  //   }
  // }, [compileStatus]);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <Button
        variant="ghost"
        className="mb-6 -ml-2 text-white hover:text-white/80 hover:bg-white/10"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Compile Code</h1>

        <Tabs defaultValue="simple" className="mb-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 mb-6">
            <TabsTrigger value="simple">Simple</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <div className="mb-6">
            <Label htmlFor="namedAddresses">Named Addresses (required)</Label>
            <Input
              id="namedAddresses"
              value={compileArgs.namedAddresses_compile}
              onChange={(e) =>
                handleChange("namedAddresses_compile", e.target.value)
              }
              placeholder="e.g. alice=0x1234, bob=0x5678"
              className="bg-gray-800 border-gray-700 mt-2"
            />
          </div>

          <TabsContent value="advanced">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Save Metadata</Label>
                  <div className="text-sm text-gray-400">
                    Save the package metadata in build directory
                  </div>
                </div>
                <Switch
                  checked={compileArgs.saveMetadata}
                  onCheckedChange={(checked) =>
                    handleChange("saveMetadata", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Fetch Dependencies Only</Label>
                  <div className="text-sm text-gray-400">
                    Skip compilation, only fetch dependencies
                  </div>
                </div>
                <Switch
                  checked={compileArgs.fetchDepsOnly}
                  onCheckedChange={(checked) =>
                    handleChange("fetchDepsOnly", checked)
                  }
                />
              </div>

              <div>
                <Label>Artifacts</Label>
                <Select
                  value={compileArgs.artifacts}
                  onValueChange={(value) => handleChange("artifacts", value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 mt-2">
                    <SelectValue placeholder="Select artifacts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="sparse">Sparse</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Package Directory</Label>
                <Input
                  value={compileArgs.packageDir_compile}
                  onChange={(e) =>
                    handleChange("packageDir_compile", e.target.value)
                  }
                  placeholder="Path to Move package"
                  className="bg-gray-800 border-gray-700 mt-2"
                />
              </div>

              <div>
                <Label>Output Directory</Label>
                <Input
                  value={compileArgs.outputDir}
                  onChange={(e) => handleChange("outputDir", e.target.value)}
                  placeholder="Path to save compiled package"
                  className="bg-gray-800 border-gray-700 mt-2"
                />
              </div>

              <div>
                <Label>Override Standard Library</Label>
                <Select
                  value={compileArgs.overrideStd || ""}
                  onValueChange={(value) =>
                    handleChange("overrideStd", value || null)
                  }
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 mt-2">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mainnet">Mainnet</SelectItem>
                    <SelectItem value="testnet">Testnet</SelectItem>
                    <SelectItem value="devnet">Devnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-gray-800" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dev Mode</Label>
                  <div className="text-sm text-gray-400">
                    Use dev-addresses and dev-dependencies
                  </div>
                </div>
                <Switch
                  checked={compileArgs.devMode}
                  onCheckedChange={(checked) =>
                    handleChange("devMode", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Skip Git Dependencies</Label>
                  <div className="text-sm text-gray-400">
                    Skip pulling latest git dependencies
                  </div>
                </div>
                <Switch
                  checked={compileArgs.skipGitDeps}
                  onCheckedChange={(checked) =>
                    handleChange("skipGitDeps", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Skip Attribute Checks</Label>
                  <div className="text-sm text-gray-400">
                    Do not complain about unknown attributes in Move code
                  </div>
                </div>
                <Switch
                  checked={compileArgs.skipAttributeChecks}
                  onCheckedChange={(checked) =>
                    handleChange("skipAttributeChecks", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Check Test Code</Label>
                  <div className="text-sm text-gray-400">
                    Apply extended checks for Aptos on test code
                  </div>
                </div>
                <Switch
                  checked={compileArgs.checkTestCode}
                  onCheckedChange={(checked) =>
                    handleChange("checkTestCode", checked)
                  }
                />
              </div>

              <div>
                <Label>Optimization Level</Label>
                <Select
                  value={compileArgs.optimization}
                  onValueChange={(value) => handleChange("optimization", value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 mt-2">
                    <SelectValue placeholder="Select optimization level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="extra">Extra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleCompile}
          disabled={compiling}
        >
          {compiling ? <Loader2 /> : "Compile"}
        </Button>
      </div>

      <StatusDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        loading={compiling}
        status={compileStatus}
        loadingTitle="Initializing..."
        loadingMessage="Please wait while Initialize Project..."
        successTitle="Initializion Successful"
        errorTitle="Initializion Failed"
        successAction={{
          label: "Go to Compiler",
          onClick: () => navigate("/"),
        }}
      />
    </div>
  );
}
