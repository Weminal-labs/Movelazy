import { Outlet } from 'react-router-dom'
import { SolNavbar } from '../../components/sol/SolNavbar'

const SolPage = () => {
  return (
    <div className="min-h-screen bg-[#0e0f0e]">
      <SolNavbar />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  )
}

export default SolPage