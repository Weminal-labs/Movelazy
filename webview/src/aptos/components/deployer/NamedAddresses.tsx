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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Enter named addresses"
            />
        </div>
    );
};

export default NamedAddressesInput; 