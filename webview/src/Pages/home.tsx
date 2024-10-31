import { useNavigate } from 'react-router-dom'
import { ArrowRight } from '../assets/icons/ArrowRight/ArrowRight'

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <button
        onClick={() => navigate('/sol')}
        className="flex items-center gap-2 px-6 py-3 text-white transition-all border rounded-lg hover:bg-white/10"
      >
        <span>Solidity</span>
        <ArrowRight className="w-5 h-5" />
      </button>

      <button
        onClick={() => navigate('/aptos')}
        className="flex items-center gap-2 px-6 py-3 text-white transition-all border rounded-lg hover:bg-white/10"
      >
        <span>Aptos</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  )
}

export default HomePage
