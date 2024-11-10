import { Outlet } from 'react-router-dom'

export const RootLayout = () => {
    return (
        <div className="min-h-screen bg-[#0e0f0e]">
            <main>
                <Outlet />
            </main>
        </div>
    )
}