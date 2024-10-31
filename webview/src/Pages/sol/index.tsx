import { Outlet, Link } from 'react-router-dom'

const SolPage = () => {
  return (
    <div className="min-h-screen bg-[#0e0f0e]">
      <nav className="p-4 border-b border-white/10">
        <ul className="flex gap-4">
          <li>
            <Link to="compiler" className="text-white hover:text-white/80">
              Compiler
            </Link>
          </li>
          <li>
            <Link to="tester" className="text-white hover:text-white/80">
              Tester
            </Link>
          </li>
          <li>
            <Link to="deployer" className="text-white hover:text-white/80">
              Deployer
            </Link>
          </li>
        </ul>
      </nav>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  )
}

export default SolPage