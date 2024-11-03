import { CompilerSettings } from './settings';

export type CompilerMessage = {
    command: 'solidity.compile'
    | 'solidity.getSettings'
    | 'solidity.updateConfig'
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
    | 'solidity.getAccountNonce';
    settings?: CompilerSettings;
};

export type VSCodeMessage = {
    type: 'settings' | 'compileStatus' | 'workspaceStatus' | 'error';
    settings?: CompilerSettings;
    success?: boolean;
    message?: string;
    initialized?: boolean;
    loading?: boolean;
    error?: string;
};
