import { CompilerMessage } from './messages';

export interface VSCodeApi {
    postMessage(message: CompilerMessage): void;
}

declare global {
    interface Window {
        vscode: VSCodeApi;
    }
}


// Example function to log VSCode API usage
export function logPostMessage(message: CompilerMessage) {
    console.log("Posting message to VSCode:", message);
}