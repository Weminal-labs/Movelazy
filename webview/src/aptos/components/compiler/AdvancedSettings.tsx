interface AdvancedSettingsProps {
    bytecodeHash: string;
    onChange: (key: string, value: string | boolean) => void;
}

export const AdvancedSettings = ({ onChange }: AdvancedSettingsProps) => {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-text-muted text-sm mb-2">
                    Bytecode Hash
                </label>
                <select
                    onChange={(e) => {
                        onChange('bytecodeHash', e.target.value);
                    }}
                    className="w-full bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
                >

                        <option value="7">7</option>
                </select>
            </div>
        </div>
    );
};