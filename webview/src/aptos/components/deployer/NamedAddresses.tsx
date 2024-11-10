import React from 'react';

interface NamedAddressesInputProps {
    namedAddresses: string;
    onChange: (value: string) => void;
}

const NamedAddressesInput: React.FC<NamedAddressesInputProps> = ({ namedAddresses, onChange }) => {
    return (
        <div className="flex flex-col">
            <label htmlFor="namedAddresses" className="text-sm font-medium text-gray-700">
                Named Addresses
            </label>
            <input
                type="text"
                id="namedAddresses"
                value={namedAddresses}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
                placeholder="Enter named addresses"
            />
        </div>
    );
};

export default NamedAddressesInput; 