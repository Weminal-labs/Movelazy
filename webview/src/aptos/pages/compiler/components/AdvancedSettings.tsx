interface AdvancedSettingsProps {
    bytecodeHash: string;
    moveVersion: string;
    onChange: (key: string, value: string | boolean) => void;
}

export const AdvancedSettings = ({ bytecodeHash, moveVersion, onChange }: AdvancedSettingsProps) => {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-text-muted text-sm mb-2">
                    Bytecode Hash
                </label>
                <select
                    value={moveVersion === 'Move 2' ? '7' : bytecodeHash}
                    onChange={(e) => {
                        if (moveVersion === 'Move 1') {
                            onChange('bytecodeHash', e.target.value);
                        }
                    }}
                    className="w-full bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
                    disabled={moveVersion === 'Move 2'}
                >
                    {moveVersion === 'Move 1' && (
                        <>
                            <option value="6">6</option>
                            <option value="7">7</option>
                        </>
                    )}
                    {moveVersion === 'Move 2' && (
                        <option value="7">7</option>
                    )}
                </select>
            </div>
        </div>
    );
};