import { CompilerSettings, DeployerSettings, Flags } from "./settings";

export type AptosMessage = {
  command:
    | "aptos.getSettings"
    | "aptos.check"
    | "aptos.checkInit"
    | "aptos.init"
    | "aptos.info"
    | "aptos.moveinit"
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
  initArgs?: [
    string,
    string,
    string,
    string,
    boolean,
    boolean,
    string,
    string,
    boolean
  ];
  compileArgs?: [
    boolean,
    boolean,
    string,
    string,
    string,
    string,
    string,
    boolean,
    boolean,
    boolean,
    boolean,
    string
  ];
  settings?: CompilerSettings | DeployerSettings;
  flags?: Flags;
};
