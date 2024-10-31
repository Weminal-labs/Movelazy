import { Outlet } from 'react-router-dom'
import { AptosNavbar } from './components/AptosNavbar'

const AptosPage = () => {
    return (
        <div className="min-h-screen bg-[#0e0f0e]">
            <AptosNavbar />
            <main className="p-4">
                <Outlet />
            </main>
        </div>
    )
}

export default AptosPage
