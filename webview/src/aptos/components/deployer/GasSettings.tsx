interface GasSettingsProps {
  gasLimit: number
  value: string
  onChange: (key: string, value: number | string) => void
}

export const GasSettings = ({ gasLimit , onChange }: GasSettingsProps) => {
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
    </div>
  )
} 