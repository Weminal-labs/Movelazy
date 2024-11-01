import { CompilerSettings } from "./settings";

export interface CompilerMessage {
    command: 'getSettings' | 'updateConfig' | 'compile' | 'initWorkspace';
    settings?: CompilerSettings;
}

export interface VSCodeApi {
    postMessage: (message: CompilerMessage) => void;
}

export interface CompileStatusMessage {
    type: 'compileStatus';
    success: boolean;
    message: string;
}

export interface SettingsMessage {
    type: 'settings';
    settings: CompilerSettings;
}

export interface WorkspaceStatusMessage {
    type: 'workspaceStatus';
    initialized: boolean;
    loading: boolean;
    error: string | null;
}

export type ExtensionMessage = CompileStatusMessage | SettingsMessage | WorkspaceStatusMessage;
