import React from 'react';
import { Link, Route, Router, Routes, useNavigate } from "react-router-dom";
import { Tab } from '../../components/Tab';
import { CoinIcon } from '../../assets/icons/CoinIcon';
import { FoundryIcon } from '../../assets/icons/FoundryIcon';
import { WalletIcon } from '../../assets/icons/WalletIcon';
import { FaucetIcon } from '../../assets/icons/FaucetIcon';
import SolCompiler from './sol_compiler';
import NavigateTitle from '../../components/Header';
import DeployFoundry from '../../components/sol/DeployFoundry';
import AddressFoundry from '../../components/sol/AddressFoundry';
import AccountBalance from '../../components/sol/account';

const Foundry: React.FC = () => {
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate(`/`);
  };
  return (
    <div className="h-[200vh] grow overflow-y-scroll">
      <div className="absolute w-[640px] sidebar:w-[400px] h-[766px] top-[-178px] left-[25px]">
        <div className="flex flex-col w-full items-start gap-[64px] absolute top-[228px] left-0">
          <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full">
              <button
                className="px-4 py-2 bg-[#ffffff1a] text-white rounded hover:bg-[#ffffff33] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full"
              >
                <Link to="your-address-foundry" className="focus:outline-none"
                  state={{ page: 'foundry' }}
                >
                  <Tab
                    icon={<WalletIcon className="!relative !w-[24px] !h-[24px]" />}
                    title="YourAddress"
                  />
                </Link>
              </button>

              <a
                href="https://faucet.movementlabs.xyz/?network=mevm"
                target="_blank"
                className="px-4 py-2 bg-[#ffffff1a] text-white rounded hover:bg-[#ffffff33] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full"
              >

                <Tab
                  icon={<FaucetIcon className="!relative !w-[24px] !h-[24px]" />}
                  title="Faucets"
                />
              </a>
              <button
                className="px-4 py-2 bg-[#ffffff1a] text-white rounded hover:bg-[#ffffff33] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full"

              >
                <Link to="account-balance" className="focus:outline-none"
                  state={{ page: 'foundry' }}
                >
                  <Tab
                    icon={<CoinIcon className="!relative !w-[24px] !h-[24px]" />}
                    title="Account Balance"
                  />
                </Link>
              </button>

              <button
                className="px-4 py-2 bg-[#ffffff1a] text-white rounded hover:bg-[#ffffff33] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full"
              >
                <Link to="deploy-foundry" className="focus:outline-none"
                  state={{ page: 'foundry' }}
                >
                  <Tab
                    icon={<FoundryIcon className="!relative !w-[24px] !h-[24px]" />}
                    title="Deploy"
                  />
                </Link>
              </button>
              <button className="px-4 py-2 bg-[#ffffff1a] text-white rounded hover:bg-[#ffffff33] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full">
                <Link to="compiler" className="focus:outline-none" state={{ page: 'foundry' }}>
                  <Tab
                    icon={<FoundryIcon className="!relative !w-[24px] !h-[24px]" />}
                    title="Compiler"
                  />
                </Link>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Routes>
        <Route index element={
          <NavigateTitle handleNavigate={handleNavigate} iconType="foundry" title="Solidity" />
        } />
        <Route path="compiler" element={<SolCompiler />} />
        <Route path="deploy-foundry" element={<DeployFoundry />} />
        <Route path="your-address-foundry" element={<AddressFoundry />} />
        <Route path="account-balance" element={<AccountBalance />} />
      </Routes>
    </div>
  );
};

export default Foundry;
