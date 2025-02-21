interface Settings {
  namedAddresses: string;
  optimizer: boolean;
  optimizerlevel: string;
  network: string;
}

export type CompileSettings = Settings;
export type TesterSettings = Settings;
