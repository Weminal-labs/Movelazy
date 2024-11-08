import { SolidityMessage } from './messages';
import { AptosMessage } from '../../aptos/types/messages';

export interface VSCodeApi {
    postMessage(message: SolidityMessage | AptosMessage): void;
}

// declare global {
//     interface Window {
//         vscode: VSCodeApi;
//     }
// }
