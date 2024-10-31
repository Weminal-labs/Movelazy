interface GasSettingsProps {
  gasLimit: number
  value: string
  onChange: (key: string, value: number | string) => void
}

export const GasSettings = ({ gasLimit, value, onChange }: GasSettingsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-text-muted text-sm mb-2">
          Gas Limit
        </label>
        <input
          type="number"
          value={gasLimit}
          onChange={(e) => onChange('gasLimit', parseInt(e.target.value))}
          className="w-full bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-text-muted text-sm mb-2">
          Value
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange('value', e.target.value)}
            className="flex-1 bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
          />
          <select 
            className="w-24 bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
          >
            <option>Wei</option>
            <option>Gwei</option>
            <option>Ether</option>
          </select>
        </div>
      </div>
    </div>
  )
} 