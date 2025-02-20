interface Settings {
  packageDir: string;
  namedAddresses: string;
  optimizer: boolean;
  optimizerlevel: string;
  bytecodeHash: string;
  network: string;
}

export type CompileSettings = Settings;
export type TesterSettings = Settings;
