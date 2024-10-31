import { Link } from 'react-router-dom'

export const SolNavbar = () => {
  return (
    <nav className="p-4 border-b border-white/10">
      <ul className="flex gap-4">
        <li>
          <Link to="/sol/compiler" className="text-white hover:text-white/80">
            Compiler
          </Link>
        </li>
        <li>
          <Link to="/sol/tester" className="text-white hover:text-white/80">
            Tester
          </Link>
        </li>
        <li>
          <Link to="/sol/deployer" className="text-white hover:text-white/80">
            Deployer
          </Link>
        </li>
      </ul>
    </nav>
  )
}