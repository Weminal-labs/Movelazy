export interface ConstructorParam {
    name: string;
    type: string;
    value: string;
}

export interface ContractDeployerProps {
    selectedContract: string;
    constructorParams: ConstructorParam[];
    onChange: (contract: string, params: ConstructorParam[]) => void;
    onDeploy: () => void;
    disabled: boolean;
}
