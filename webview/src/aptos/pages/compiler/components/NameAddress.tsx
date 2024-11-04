import React from 'react';

interface NamedAddressesInputProps {
    namedAddresses: string;
    onChange: (value: string) => void;
}

const NamedAddressesInput: React.FC<NamedAddressesInputProps> = ({ namedAddresses, onChange }) => {
    return (
        <div className="mb-4">
            <label className="block text-text-muted text-sm mb-2">Named Addresses</label>
            <input
                type="text"
                value={namedAddresses}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
                placeholder="Enter named addresses"
            />
        </div>
    );
};

export default NamedAddressesInput;