import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import './styles/index.css'
import { RootLayout } from './RootLayout'
import HomePage from './Pages/home'
//------------------- Solidity imports --------------------- //
import SolPage from './Pages/sol'
import CompilerPage from './Pages/sol/pages/compiler'
import TesterPage from './Pages/sol/pages/tester'
import DeployerPage from './Pages/sol/pages/deployer'

//------------------- Aptos imports --------------------- //
import AptosPage from './Pages/aptos'


// Router configuration
const router = createMemoryRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'sol',
        element: <SolPage />,
        children: [
          {
            path: 'compiler',
            element: <CompilerPage />
          },
          {
            path: 'tester',
            element: <TesterPage />
          },
          {
            path: 'deployer',
            element: <DeployerPage />
          }
        ]
      },
      {
        path: 'aptos',
        element: <AptosPage />,
        children: [
          // Các nested routes của Aptos có thể thêm ở đây
        ]
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
