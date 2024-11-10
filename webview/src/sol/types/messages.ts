/* import { CompilerSettings, Flags } from './settings';

export type CompilerMessage = {
    command: 'aptos.getSettings' | 'aptos.updateConfig' | 'aptos.compile' | 'aptos.initWorkspace' | 'aptos.clean' | 'aptos.checkWorkspace' | 'aptos.tester' | 'aptos.deploy';
    settings?: CompilerSettings | DeployerSettings;
    flags?: Flags;
};

export type VSCodeMessage = {
    type: 'settings' | 'compileStatus' | 'workspaceStatus' | 'error' | 'testerStatus';
    settings?: CompilerSetting | DeployerSettings;
} */

import { DeployMessage } from './deployment';
import { CompilerConfig } from './settings';

export type SolidityMessage = {
    command: 'solidity.compile'
    | 'solidity.getSettings'
    | 'solidity.initWorkspace'
    | 'solidity.checkWorkspace'
    | 'solidity.clean'
    | 'solidity.getContractFiles'
    | 'solidity.startLocalNode'
    | 'solidity.stopLocalNode'
    | 'solidity.deploy'
    | 'solidity.getAccounts'
    | 'solidity.setAccount'
    | 'solidity.getAccountBalance'
    | 'solidity.getAccountPrivateKey'
    | 'solidity.getAccountNonce'
    | 'solidity.getCompiledContracts';
    settings?: CompilerConfig | DeployMessage;
};

export type VSCodeMessage = {
    type: 'settings' | 'compileStatus' | 'workspaceStatus' | 'error';
    settings?: CompilerConfig;
    success?: boolean;
    message?: string;
    initialized?: boolean;
    loading?: boolean;
    error?: string;
};
