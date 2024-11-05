interface AccountInfoProps {
  account: string
  balance: string
}

export const AccountInfo = ({ account, balance }: AccountInfoProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-text-muted text-sm mb-2">
          Account
        </label>
        <div className="flex items-center gap-4">
          <select 
            className="flex-1 bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
            value={account}
          >
            <option value="">{account || 'No account loaded...'}</option>
          </select>
          <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors">
            Connect
          </button>
        </div>
      </div>

      <div>
        <label className="block text-text-muted text-sm mb-2">
          Balance
        </label>
        <div className="w-full bg-background-dark text-text p-4 rounded-lg border border-border">
          {balance} 
        </div>
      </div>
    </div>
  )
} 