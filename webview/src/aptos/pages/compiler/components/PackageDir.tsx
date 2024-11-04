import React from 'react';

interface PackageDirInputProps {
    packageDir: string;
    onChange: (value: string) => void;
}

const PackageDirInput: React.FC<PackageDirInputProps> = ({ packageDir, onChange }) => {
    return (
        <div className="mb-4">
            <label className="block text-text-muted text-sm mb-2">Package Directory</label>
            <input
                type="text"
                value={packageDir}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
                placeholder="Enter package directory"
            />
        </div>
    );
};

export default PackageDirInput;