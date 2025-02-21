import { useNavigate } from "react-router-dom";
import { ArrowRight } from "./assets/icons/ArrowRight/ArrowRight";
import logo from "./assets/logo.svg";
import { VSCodeApi } from "./utils/vscode";

declare global {
  interface Window {
    vscode: VSCodeApi;
  }
}

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <div className="flex flex-col items-center">
        <img src={logo} alt="Logo" className="w-32 h-32" />
        <h1 className="font-pacifico text-4xl text-white mt-4 mb-8">
          Movelazy
        </h1>
      </div>

      <button
        onClick={() => navigate("/sol")}
        className="flex items-center gap-2 px-6 py-3 text-white transition-all border rounded-lg hover:bg-white/10"
      >
        <span>Solidity</span>
        <ArrowRight className="w-5 h-5" />
      </button>

      <button
        onClick={() => navigate("/aptos")}
        className="flex items-center gap-2 px-6 py-3 text-white transition-all border rounded-lg hover:bg-white/10"
      >
        <span>Aptos</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default HomePage;
