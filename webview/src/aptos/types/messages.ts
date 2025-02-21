import { CompilerSettings, DeployerSettings, Flags } from "./settings";

export type AptosMessage = {
  command:
  | "aptos.getSettings"
  | "aptos.check"
  | "aptos.checkInit"
  | "aptos.init"
  | "aptos.updateConfig"
  | "aptos.compile"
  | "aptos.initWorkspace"
  | "aptos.clean"
  | "aptos.checkWorkspace"
  | "aptos.tester"
  | "aptos.deploy"
  | "aptos.accountAddress"
  | "aptos.requestFaucet"
  | "aptos.balance"
  | "aptos.checkFolder"
  | "aptos.selectFolder"
  | "aptos.createTemplate";
  initConfig?: [string, string, string, string];
  settings?: CompilerSettings | DeployerSettings;
  flags?: Flags;
};