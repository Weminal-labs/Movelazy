import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

interface WorkspaceStatus {
  loading: boolean;
  initialized?: boolean;
  error?: string;
}

const AptosPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAptosInstalled, setIsAptosInstalled] = useState<boolean | null>(
    null
  );
  const [status, setStatus] = useState<WorkspaceStatus>({ loading: true });

  useEffect(() => {
    console.log("🔹 Sending message to VS Code to check Aptos...");
    window.vscode.postMessage({ command: "aptos.check" });

    const messageHandler = (event: MessageEvent) => {
      console.log("📩 Received message from VS Code:", event.data);
      const message = event.data;

      if (message.type === "CliStatus" || message.type === "error") {
        console.log(
          "✅ Aptos CLI Status:",
          message.installed ? "Installed" : "Not Installed"
        );
        setIsAptosInstalled(message.installed);
      }
    };

    window.addEventListener("message", messageHandler);
    return () => window.removeEventListener("message", messageHandler);
  }, []);

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;

      switch (message.type) {
        case "settings":
          setStatus({
            loading: false,
            initialized: true,
          });
          if (location.pathname === "/aptos") {
            navigate("/aptos/project");
          }
          break;
        case "workspaceStatus":
          setStatus({
            loading: message.loading,
            initialized: message.initialized,
            error: message.error,
          });
          break;
      }
    };
    window.addEventListener("message", messageHandler);
    if (window.vscode) {
      window.vscode.postMessage({ command: "aptos.getSettings" });
    }

    return () => window.removeEventListener("message", messageHandler);
  }, [navigate, location]);

  useEffect(() => {
    if (
      !status.loading &&
      !status.initialized &&
      location.pathname === "/aptos/compiler"
    ) {
      navigate("/aptos/project");
    }
  }, [status, navigate, location.pathname]);

  useEffect(() => {
    if (isAptosInstalled === false) {
      console.log(
        "🚨 Aptos CLI is not installed. Redirecting to installation page..."
      );
      navigate("/aptos/cli-not-found");
    }
  }, [isAptosInstalled, navigate]);

  return (
    <div className="min-h-screen bg-[#0e0f0e]">
      <main className="p-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AptosPage;
