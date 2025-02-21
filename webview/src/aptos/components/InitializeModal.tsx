import { useEffect, useState } from "react";

interface InitializeModalProps {
  onClose: () => void;
}

const InitializeModal = ({ onClose }: InitializeModalProps) => {
  const [step, setStep] = useState<"folder" | "template" | "done">("folder");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;
      switch (message.type) {
        case "folderStatus":
          if (message.hasFolder) {
            setStep("template");
          }
          break;
        case "workspaceStatus":
          if (message.initialized) {
            setStep("done");
            setTimeout(onClose, 1500);
          } else if (message.error) {
            setError(message.error);
          }
          break;
      }
    };

    window.addEventListener("message", messageHandler);
    if (window.vscode) {
      window.vscode.postMessage({ command: "aptos.checkFolder" });
    }

    return () => window.removeEventListener("message", messageHandler);
  }, [onClose]);

  const handleSelectFolder = () => {
    if (window.vscode) {
      window.vscode.postMessage({ command: "aptos.selectFolder" });
    }
  };

  const handleCreateTemplate = () => {
    if (window.vscode) {
      window.vscode.postMessage({ command: "aptos.createTemplate" });
    }
  };

  const handleInitialize = () => {
    if (window.vscode) {
      window.vscode.postMessage({ command: "aptos.initWorkspace" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background-light border border-border rounded-lg p-6 max-w-md w-full mx-4">
        {step === "folder" && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">
              Select Project Folder
            </h2>
            <p className="text-gray-400 mb-6">
              Please select a folder for your Aptos project
            </p>
            <button
              onClick={handleSelectFolder}
              className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
            >
              Select Folder
            </button>
          </div>
        )}

        {step === "template" && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Initialize Project</h2>
            {error ? (
              <p className="text-red-500 mb-4">{error}</p>
            ) : (
              <p className="text-gray-400 mb-6">
                Would you like to create a template project or start from
                scratch?
              </p>
            )}
            <div className="flex gap-4">
              <button
                onClick={handleCreateTemplate}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Use Template
              </button>
              <button
                onClick={handleInitialize}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
              >
                Start Empty
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Project Ready!</h2>
            <p className="text-gray-400">
              Your project has been initialized successfully.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InitializeModal;
