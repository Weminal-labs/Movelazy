"use client";

import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { useEffect, useState } from "react";
import { StatusDialog } from "../../components/status-dialog";

export default function AptosHelp() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [cliStatus, setcliStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });
  const [showDialog, setShowDialog] = useState(false);

  const handleAiCommand = () => {
    if (!window.vscode) {
      return;
    }
    setIsLoading(true)
    setShowDialog(true)
    window.vscode.postMessage({
      command: "ai-command",
    });
  };

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === "cliStatus" && message.message) {
        let finalMessage = message.message;

        if (typeof message.message === "string") {
          const jsonMatch = message.message.match(/{[\s\S]*}$/);
          if (jsonMatch) {
            try {
              finalMessage = JSON.parse(jsonMatch[0]);
            } catch (error) {
              console.error("Can not parse JSON:", error);
            }
          }
        }

        if (typeof finalMessage === "object" && finalMessage.out) {
          finalMessage = finalMessage.out;
        } else if (typeof finalMessage === "object") {
          // Nếu không có thuộc tính .out, chuyển thành chuỗi để đảm bảo an toàn khi render
          finalMessage = JSON.stringify(finalMessage, null, 2);
        }

        setcliStatus({
          type: message.success ? "success" : "error",
          message: finalMessage,
        });

        setIsLoading(false);
        console.log("cliStatus: ", finalMessage);
        setShowDialog(true);
      }
    };

    window.addEventListener("message", messageHandler);
    return () => window.removeEventListener("message", messageHandler);
  }, []);
  return (
    <div className="min-h-screen bg-black">
      <Card className="w-full min-h-screen border-gray-800 bg-gray-900/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <Button
              onClick={() => navigate("/aptos/project")}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-2 border-gray-700 bg-white-800/50 hover:bg-red-800"
            >
              Back
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <Button
              onClick={() => { handleAiCommand() }}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800"
            >
              AI Command
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <Button
              onClick={() => navigate("/aptos")}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800"
            >
              Aptos account
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <Button
              onClick={() => navigate("/aptos")}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800"
            >
              Aptos config
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <Button
              onClick={() => navigate("/aptos")}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800"
            >
              Aptos genesis
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <Button
              onClick={() => navigate("/aptos")}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800"
            >
              Aptos governance
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <Button
              onClick={() => navigate("/aptos/info")}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800"
            >
              Aptos info
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <Button
              onClick={() => navigate("/aptos/init")}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800"
            >
              Aptos init
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <Button
              onClick={() => navigate("/aptos")}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800"
            >
              Aptos key
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <Button
              onClick={() => navigate("/aptos/move")}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800"
            >
              Aptos move
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <Button
              onClick={() => navigate("/aptos")}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800"
            >
              Aptos multisig
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <Button
              onClick={() => navigate("/aptos")}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800"
            >
              Aptos node
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <Button
              onClick={() => navigate("/aptos")}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800"
            >
              Aptos stake
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Button
              onClick={() => navigate("/aptos")}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800"
            >
              Aptos update
            </Button>
          </div>

        </CardContent>
        <StatusDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          loading={isLoading}
          status={cliStatus}
          loadingTitle="Ai Executing..."
          loadingMessage="Please wait while running command..."
          successTitle="Ai Execution Successful"
          errorTitle="Ai Execution Failed"
        />
      </Card>
    </div>
  );
}
