import { useEffect, useState } from "react";
import { DeployerSettings } from "../../../aptos/types/settings";
import NamedAddressesInput from "../../components/deployer/NamedAddresses";
import AccountAddress from "../../components/deployer/AccountInfo";
import { DeployStatus } from "../../types/status";

const DeployerPage = () => {
  const [settings, setSettings] = useState<DeployerSettings>({
    nameAddresses: "",
    account: "",
    balance: 0,
  });

  const [isLoading, setIsLoading] = useState(false);

  const [accountAddress, setAccountAddress] = useState<string>("");
  const [balance, setBalance] = useState<number | null>(0);
  const [deploying, setDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<DeployStatus>({
    type: null,
    message: "",
    stdout: "",
    stderr: "",
  });

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;
      console.log("Received message:", message);

      if (message.type === "deployStatus") {
        setDeploying(false);
        setDeployStatus({
          type: message.success ? "success" : "error",
          message: message.message,
          stdout: message.stdout,
          stderr: message.stderr,
        });
      }

      if (message.type === "accountAddress") {
        console.log("Received account address:", message.address);
        setAccountAddress(message.address);
      }

      if (message.type === "balance") {
        console.log("Received balance:", message.balance);
        setBalance(message.balance / 1e8); // Cập nhật balance
      }
    };

    window.addEventListener("message", messageHandler);

    // Yêu cầu cập nhật balance và account address khi component mount
    window.vscode.postMessage({
      command: "aptos.balance",
    });
    window.vscode.postMessage({
      command: "aptos.accountAddress",
    });

    return () => window.removeEventListener("message", messageHandler);
  }, []);

  const handleDeploy = async () => {
    setIsLoading(true);

    if (!settings.nameAddresses) {
      setDeployStatus({
        type: "error",
        message: "Named addresses are required.",
        stdout: "",
        stderr: "",
      });
      setIsLoading(false);
      return;
    }

    setDeploying(true);
    setDeployStatus({ type: null, message: "", stdout: "", stderr: "" });
    console.log("Deploying with named addresses:", settings.nameAddresses);
    if (window.vscode) {
      try {
        window.vscode.postMessage({
          command: "aptos.deploy",
          settings: settings,
        });
      } catch {
        setDeploying(false);
        setDeployStatus({
          type: "error",
          message: "Failed to start deployment",
          stdout: "",
          stderr: "",
        });
      }
    }
  };

  const extractJSON = (stdout: string) => {
    try {
      // Tìm khối JSON trong stdout
      const jsonMatch = stdout.match(/{.*}/s); // Regex để tìm JSON đầu tiên
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]); // Phân tích cú pháp JSON
      }
      console.error("No JSON found in stdout");
      return null;
    } catch (error) {
      console.error("Failed to parse stdout:", error);
      return null;
    }
  };

  const getTransactionHash = (stdout: string) => {
    const parsedResult = extractJSON(stdout);
    console.log("check parsedResult", parsedResult);
    return parsedResult?.Result?.transaction_hash || "";
  };

  useEffect(() => {
    if (deployStatus.type === "success") {
      setIsLoading(false);
    }
  }, [deployStatus.type]);

  return (
    <div className="flex flex-col w-full h-[calc(100vh-64px)]">
      <div className="flex-1 bg-background-light border border-border">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-text text-2xl font-medium">Deploy Settings</h3>
            <div className="flex gap-4">
              <button
                onClick={handleDeploy}
                disabled={deploying}
                className={`px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors ${
                  deploying ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {deploying ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deploying...
                  </div>
                ) : (
                  "Deploy"
                )}
              </button>
            </div>
          </div>
          <div className="mt-2 space-y-6">
            <AccountAddress
              namedAddresses={accountAddress || ""}
              onChange={(value) => {
                setAccountAddress(value);
              }}
              balance={balance}
            />
            <NamedAddressesInput
              namedAddresses={settings.nameAddresses || ""}
              onChange={(value) => {
                setSettings({ ...settings, nameAddresses: value });
              }}
            />
          </div>
        </div>
        <div>
          {isLoading ? (
            // Hiển thị trạng thái "Đang load..."
            <div className="p-4 border-t  bg-blue-500/5 text-blue-500 border-blue-500/20">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                <span className="font-mono text-sm text-blue-500">
                  Loading...
                </span>
              </div>
            </div>
          ) : deployStatus.type === "success" ? (
            // Hiển thị trạng thái thành công
            <div className="p-4 border-t  bg-green-500/5 text-green-500 border-green-500/20">
              <pre className="font-mono text-sm whitespace-pre-wrap">
                {deployStatus.message}
              </pre>
            </div>
          ) : deployStatus.message === "" ? (
            <></>
          ) : (
            <div className="p-4 border-t bg-red-500/5 text-red-500 border-red-500/20">
              <pre className="font-mono text-sm whitespace-pre-wrap">
                {deployStatus.message}
              </pre>
            </div>
          )}
        </div>
        {deployStatus.stdout &&
          (() => {
            const transactionHash = getTransactionHash(deployStatus.stdout);
            return transactionHash ? (
              <>
                <div className="mt-2">
                  <div
                    className='className="flex-1  text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary
               truncate'
                  >
                    <label className="block text-text-muted text-sm mb-2">
                      Transaction Hash:
                    </label>

                    {transactionHash}
                  </div>
                </div>
                <a
                  href={`https://explorer.movementnetwork.xyz/txn/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white transition-colors bg-amber-500 rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  View on Explorer
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="ml-2 h-4 w-4"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              </>
            ) : (
              <div className="p-4 text-red-500">
                Transaction hash not available.
              </div>
            );
          })()}
      </div>
    </div>
  );
};

export default DeployerPage;
