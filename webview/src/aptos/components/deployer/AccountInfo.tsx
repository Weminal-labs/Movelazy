import React from 'react';

interface AccountProps {
  namedAddresses: string;
}

const AccountAddress: React.FC<AccountProps> = ({ namedAddresses }) => {
  return (
    <div className="mb-4">
      <label className="block text-text-muted text-sm mb-2">Account address</label>
      <input
        type="text"
        value={namedAddresses}
        className="w-full bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
      />
    </div>
  );
};

export default AccountAddress;