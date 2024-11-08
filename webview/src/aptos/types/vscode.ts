import { SolidityMessage } from '../../sol/types/messages';
import { AptosMessage } from './messages';

export interface VSCodeApi {
    postMessage(message: AptosMessage | SolidityMessage): void;
}

// declare global {
//     interface Window {
//         vscode: VSCodeApi;
//     }
// }


// Example function to log VSCode API usage
export function logPostMessage(message: AptosMessage) {
    console.log("Posting message to VSCode:", message);
}