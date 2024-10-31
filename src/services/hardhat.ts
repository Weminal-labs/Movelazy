import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers } from 'ethers';
import { WorkspaceService } from './workspace';

export class HardhatService {
  private hre!: HardhatRuntimeEnvironment;
  private provider!: ethers.providers.JsonRpcProvider;

  constructor(private workspace: WorkspaceService) { }

  async initialize() {
    if (!this.hre) {
      // Import hardhat runtime dynamically
      const hardhat = await import('hardhat');
      this.hre = hardhat as unknown as HardhatRuntimeEnvironment;
      this.provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
    }
  }

  async compile(contractPath: string) {
    await this.initialize();
    await this.hre.run('compile', {
      sources: [contractPath]
    });
    return this.hre.artifacts.readArtifactSync(contractPath);
  }

  async deploy(contractName: string, args: any[]) {
    await this.initialize();
    const signer = this.provider.getSigner();
    const factory = await ethers.ContractFactory.fromSolidity(
      await this.hre.artifacts.readArtifact(contractName),
      signer
    );
    const contract = await factory.deploy(...args);
    await contract.deployed();
    return contract;
  }
}
