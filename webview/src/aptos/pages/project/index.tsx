import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.svg";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription } from "../../components/ui/alert";

interface WorkspaceStatus {
  loading: boolean;
  hasRequiredFolders: boolean;
  initialized?: boolean;
  hasFolder?: boolean;
  error?: string;
}

const ProjectPageAptos = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<WorkspaceStatus>({
    loading: true,
    hasFolder: false,
    hasRequiredFolders: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;
      switch (message.type) {
        case "folderStatus":
          setStatus((prev) => ({
            ...prev,
            hasFolder: message.hasFolder,
            hasRequiredFolders: message.hasRequiredFolders,
            loading: false,
          }));
          console.log("check hasrequire:", message.hasRequiredFolders);
          break;
        case "workspaceStatus":
          setStatus((prev) => ({
            ...prev,
            initialized: message.initialized,
            loading: false,
            error: message.error,
          }));
          if (message.initialized && !message.loading) {
            navigate("/aptos/compiler");
          }
          break;
      }
    };

    window.addEventListener("message", messageHandler);
    if (window.vscode) {
      window.vscode.postMessage({ command: "aptos.checkFolder" });
    }

    return () => window.removeEventListener("message", messageHandler);
  }, [navigate]);

  const handleSelectFolder = () => {
    if (window.vscode) {
      window.vscode.postMessage({ command: "aptos.selectFolder" });
    }
  };

  const handleCreateTemplate = () => {
    if (window.vscode) {
      setIsLoading(true);

      window.vscode.postMessage({ command: "aptos.createTemplate" });
    }
  };

  if (status.loading) {
    return (
      <div className="flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Checking workspace status...</span>
      </div>
    );
  }

  // Project initialized
  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4 bg-black border-none">
      <Card className="w-full max-w-md border-none">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center mb-4">
            <img src={logo} alt="Logo" className="w-24 h-24" />
            <h1 className="font-pacifico text-3xl mt-4">Movelazy</h1>
          </div>
          <CardTitle className="text-2xl font-bold">
            Workspace for Aptos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {!status.hasFolder && !status.hasRequiredFolders && (
            <Alert className="border-yellow-600/20 bg-yellow-600/10">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-200">
                No Aptos workspace found! Please select a folder without Aptos
                workspace.
              </AlertDescription>
            </Alert>
          )}

          {status.hasFolder && !status.hasRequiredFolders && (
            <Alert className="border-yellow-600/20 bg-yellow-600/10">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-200">
                Not an Aptos workspace! Select another folder or create a
                template project?
              </AlertDescription>
            </Alert>
          )}

          {status.hasFolder && status.hasRequiredFolders && (
            <Alert className="border-green-600/20 bg-green-600/10">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-200">
                Aptos workspace detected! You can select another folder or go to
                compiler.
              </AlertDescription>
            </Alert>
          )}

          <Card className="w-full border-gray-800 bg-gray-900/50">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Button
                  onClick={handleSelectFolder}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800"
                  size="sm"
                >
                  Select Folder
                </Button>

                {status.hasFolder && !status.hasRequiredFolders && (
                  <Button
                    onClick={handleCreateTemplate}
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Create Template"
                    )}
                  </Button>
                )}

                {status.hasFolder && status.hasRequiredFolders && (
                  <Button
                    onClick={() => navigate("/aptos/compiler")}
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800"
                  >
                    Go to Compiler
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
export default ProjectPageAptos;
