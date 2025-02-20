import { CompilerSettings, DeployerSettings, Flags } from './settings';

// export type CompilerMessage = {
//     command: 'solidity.compile' | 'solidity.getSettings' | 'solidity.updateConfig' | 'solidity.initWorkspace' | 'solidity.checkWorkspace' | 'solidity.clean' | 'aptos.getSettings' | 'aptos.updateConfig' | 'aptos.compile' | 'aptos.initWorkspace' | 'aptos.clean' | 'aptos.checkWorkspace' | 'aptos.tester' | 'aptos.deploy';
//     settings?: CompilerSettings | DeployerSettings;
//     flags?: Flags;
// };

// export type VSCodeMessage = {
//     type: 'settings' | 'compileStatus' | 'workspaceStatus' | 'error' | 'testerStatus' | 'deployStatus';
//     settings?: CompilerSettings | DeployerSettings;
//     success?: boolean;
//     message?: string;
//     initialized?: boolean;
//     loading?: boolean;
//     error?: string;
//     flags?: Flags;
// };

export type AptosMessage = {
    command:
    'aptos.getSettings'
    | 'aptos.check'
    | 'aptos.updateConfig'
    | 'aptos.compile'
    | 'aptos.initWorkspace'
    | 'aptos.clean'
    | 'aptos.checkWorkspace'
    | 'aptos.tester'
    | 'aptos.deploy'
    | 'aptos.accountAddress'
    | 'aptos.requestFaucet'
    | 'aptos.balance';
    settings?: CompilerSettings | DeployerSettings;
    flags?: Flags;
};

export type VSCodeMessage = {
    type: 'CliStatus' | 'settings' | 'compileStatus' | 'workspaceStatus' | 'error' | 'testerStatus' | 'deployStatus';
    installed?: boolean;
    settings?: CompilerSettings | DeployerSettings;
    success?: boolean;
    message?: string;
    initialized?: boolean;
    loading?: boolean;
    error?: string;
    flags?: Flags;
};

