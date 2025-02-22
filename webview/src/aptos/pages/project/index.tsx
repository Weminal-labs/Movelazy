import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.svg";
import { AlertTriangle, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription } from "../../components/ui/alert";


const ProjectPageAptos = () => {
  const navigate = useNavigate();
  const [isAptosInitialized, setIsAptosInitialized] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    window.vscode.postMessage({ command: "aptos.checkInit" });

    const messageHandler = (event: MessageEvent) => {
      const message = event.data;

      if (message.type === "CliStatus" || message.type === "error") {
        setIsAptosInitialized(message.initialized);
      }
    };

    window.addEventListener("message", messageHandler);
    return () => window.removeEventListener("message", messageHandler);
  }, []);

  useEffect(() => {
    if (isAptosInitialized === true) {
      navigate("/aptos/help");
    }
  }, [isAptosInitialized, navigate]);

  const handleSelectFolder = () => {
    if (window.vscode) {
      window.vscode.postMessage({ command: "aptos.selectFolder" });
    }
  };

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
          {!isAptosInitialized && (
            <Alert className="border-yellow-600/20 bg-yellow-600/10">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-200">
                Aptos has not Initialized! Run the command `aptos init` or click the button below
              </AlertDescription>
            </Alert>
          )}

          {isAptosInitialized && (
            <Alert className="border-green-600/20 bg-green-600/10">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-200">
                Aptos Initialized.
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
                  Select Other Folder
                </Button>

                {!isAptosInitialized && (
                  <Button
                    onClick={() => navigate("/aptos/init")}
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800"
                  >
                    Aptos Init
                  </Button>
                )}

                {isAptosInitialized && (
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
