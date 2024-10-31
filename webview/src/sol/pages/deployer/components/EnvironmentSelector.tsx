import { useState, useRef, useEffect } from 'react'

interface EnvironmentSelectorProps {
  environment: 'vm' | 'injected' | 'web3' | 'custom'
  onChange: (environment: 'vm' | 'injected' | 'web3' | 'custom') => void
}

export const EnvironmentSelector = ({ environment, onChange }: EnvironmentSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const environments = [
    {
      id: 'vm',
      name: 'JavaScript VM (London)',
      description: 'Test deployment in a sandbox blockchain in the browser'
    },
    {
      id: 'injected',
      name: 'Injected Provider',
      description: 'MetaMask or similar wallet providers'
    },
    {
      id: 'web3',
      name: 'Web3 Provider',
      description: 'Connect to a remote node'
    },
    {
      id: 'custom',
      name: 'Custom RPC',
      description: 'Specify custom endpoint URL'
    }
  ]

  const selectedEnv = environments.find(env => env.id === environment)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="space-y-4" ref={dropdownRef}>
      <label className="block text-text-muted text-sm mb-2">
        Environment
      </label>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 rounded-lg border border-border bg-background-dark text-text hover:border-primary/50 transition-colors"
        >
          <span>{selectedEnv?.name}</span>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-background-dark border border-border rounded-lg shadow-lg">
            {environments.map(env => (
              <div
                key={env.id}
                className="flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors"
                onClick={() => onChange(env.id as typeof environment)}
              >
                <input
                  type="radio"
                  checked={environment === env.id}
                  onChange={() => onChange(env.id as typeof environment)}
                  className="w-4 h-4 text-primary"
                />
                
                <div>
                  <div className="text-text font-medium">
                    {env.name}
                  </div>
                  <div className="text-text-muted text-sm">
                    {env.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {environment === 'custom' && (
        <div>
          <label className="block text-text-muted text-sm mb-2">
            RPC Endpoint URL
          </label>
          <input
            type="text"
            placeholder="https://..."
            className="w-full bg-background-dark text-text p-4 rounded-lg border border-border focus:outline-none focus:border-primary"
          />
        </div>
      )}
    </div>
  )
} 