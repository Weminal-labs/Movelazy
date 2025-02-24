import { CompileArgs } from "./compileArgs";
import { DeployArgs } from "./deployArgs";
import { CompilerSettings, DeployerSettings, Flags } from "./settings";
import { TestArgs } from "./testArgs";

export type AptosMessage = {
  command:
    | "aptos.getSettings"
    | "aptos.check"
    | "aptos.checkInit"
    | "aptos.init"
    | "aptos.info"
    | "aptos.moveinit"
    | "aptos.movetest"
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
    | "aptos.createTemplate"
    | "aptos.checkProfile"
  | "aptos.checkBalance"
  |"ai-command";
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
  compileArgs?: CompileArgs;
  deployArgs?: DeployArgs;
  testArgs?: TestArgs;
  settings?: CompilerSettings | DeployerSettings;
  flags?: Flags;
};
