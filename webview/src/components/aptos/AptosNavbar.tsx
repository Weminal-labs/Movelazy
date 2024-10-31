import { Link } from 'react-router-dom'

export const AptosNavbar = () => {
  return (
    <nav className="p-4 border-b border-white/10">
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