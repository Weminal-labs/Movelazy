import { DeployMessage, LocalDeployMessage, NetworkDeployMessage } from './types';

export class Deployer {
    async deploy(message: DeployMessage) {
        if (message.isHardhat) {
            return this.deployLocal(message);
        } else {
            return this.deployNetwork(message);
        }
    }

    private async deployLocal(message: LocalDeployMessage) {
        // Handle local Hardhat deployment
        const { accountNumber, contractName } = message;
        console.log('Deploying locally with account number:', accountNumber, 'and contract name:', contractName);
        // Implementation details here
    }

    private async deployNetwork(message: NetworkDeployMessage) {
        // Handle network deployment
        const { NetworkConfig, contractName } = message;
        console.log('Deploying on network with config:', NetworkConfig, 'and contract name:', contractName);
        // Implementation details here
    }
}
