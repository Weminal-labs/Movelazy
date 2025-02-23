interface Settings {
  namedAddresses: string;
  optimizer: boolean;
  optimizerlevel: string;
  network: string;
}

export type TestArgs = {
  namedAddresses: string,
  filter: string,
  ignoreCompileWarnings: boolean,
  packageDir: string,
  outputDir: string,
  overrideStd: string,
  skipFetchLatestGitDeps: boolean,
  skipAttributeChecks: boolean,
  dev: boolean,
  checkTestCode: boolean,
  optimize: string,
  bytecodeVersion: string,
  compilerVersion: string,
  languageVersion: string,
  moveVersion: string,
  instructions: string,
  coverage: boolean,
  dump: boolean,
};
export type CompileSettings = Settings;
export type TesterSettings = Settings;
