import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from '../../assets/icons/ArrowLeft/ArrowLeft'

export const AptosNavbar = () => {
  const navigate = useNavigate()

  return (
    <nav className="flex items-center justify-between p-4 border-b border-white/10">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-white hover:text-white/80"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <ul className="flex gap-4">
        <li>
          <Link to="/aptos/move" className="text-white hover:text-white/80">
            Move
          </Link>
        </li>
        {/* Thêm các links khác cho Aptos */}
      </ul>
    </nav>
  )
}