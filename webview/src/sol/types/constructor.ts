export type SolidityType = 
    | 'address' 
    | 'bool'
    | 'string' 
    | 'bytes' 
    | 'uint256' 
    | 'int256'
    | 'bytes32'
    | `uint${8 | 16 | 32 | 64 | 128 | 256}`
    | `int${8 | 16 | 32 | 64 | 128 | 256}`;

export interface ConstructorParam {
    name: string;
    type: SolidityType;
    value: string | number | boolean;
}