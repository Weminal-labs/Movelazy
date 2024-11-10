interface BasicSettingsProps {
    moveVersion: string
    onChange: (key: string, value: string) => void
}

export const BasicSettings = ({ moveVersion, onChange }: BasicSettingsProps) => {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-text-muted text-sm mb-2">
                    Move Version
                </label>
                <select
                    value={moveVersion}
                    onChange={(e) => onChange('moveVersion', e.target.value)}
                    className="w-full bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
                >
                    <option>Move 1</option>
                    <option>Move 2</option>
                </select>
            </div>
        </div>
    )
}
