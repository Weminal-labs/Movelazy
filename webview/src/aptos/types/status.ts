export type StatusType = "success" | "error" | null;

export interface BaseStatus {
  type: StatusType;
  message: string;
}

export interface DeployStatus extends BaseStatus {
  stdout: string;
  stderr: string;
}

export type CompileStatus = BaseStatus;
export type TestStatus = BaseStatus;
