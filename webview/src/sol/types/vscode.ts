import { SolidityMessage } from './messages';

export interface VSCodeApi {
    postMessage(message: SolidityMessage): void;
}

declare global {
    interface Window {
        vscode: VSCodeApi;
    }
}
