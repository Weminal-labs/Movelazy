import { CompilerSettings, DeployerSettings, Flags } from "./settings";

export type AptosMessage = {
  command:
    | "aptos.getSettings"
    | "aptos.check"
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
  settings?: CompilerSettings | DeployerSettings;
  flags?: Flags;
};