import { ConstructorParam } from "../../../types/constructor"

interface ContractDeployerProps {
  selectedContract: string
  constructorParams: ConstructorParam[]
  onChange: (contract: string, params: ConstructorParam[]) => void
}

export const ContractDeployer = ({ selectedContract, constructorParams, onChange }: ContractDeployerProps) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-text-muted text-sm mb-2">
          Contract
        </label>
        <select
          value={selectedContract}
          onChange={(e) => onChange(e.target.value, constructorParams)}
          className="w-full bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
        >
          <option value="">Select a contract</option>
          {/* Contract list will be populated from compiled contracts */}
        </select>
      </div>

      {selectedContract && (
        <>
          <div>
            <label className="block text-text-muted text-sm mb-2">
              Constructor Parameters
            </label>
            <div className="space-y-4">
              {constructorParams.map((param, index) => (
                <div key={index} className="flex gap-4">
                  <input
                    type="text"
                    value={param.value as string}
                    onChange={(e) => {
                      const newParams = constructorParams.map((p, i) => i === index ? { ...p, value: e.target.value } : p)
                      onChange(selectedContract, newParams)
                    }}
                    placeholder={`param ${index + 1}`}
                    className="flex-1 bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => {
                      const newParams = constructorParams.filter((_, i) => i !== index)
                      onChange(selectedContract, newParams)
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => onChange(selectedContract, [...constructorParams, { name: '', type: '', value: '' } as ConstructorParam])}
              className="mt-4 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
            >
              Add Parameter
            </button>
          </div>

          <div className="flex justify-end">
            <button className="px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors">
              Deploy
            </button>
          </div>
        </>
      )}
    </div>
  )
} 