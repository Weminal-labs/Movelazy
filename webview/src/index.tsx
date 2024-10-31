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
import CompilerPageAptos from './Pages/aptos/pages/YourAddress'
import TesterPageAptos from './Pages/aptos/pages/AccountBalance'
import DeployerPageAptos from './Pages/aptos/pages/deployer'
import YourAddress from './Pages/aptos/pages/YourAddress'
import { AccountAddress } from '@aptos-labs/ts-sdk'
import AccountBalance from './Pages/aptos/pages/AccountBalance'

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
          {
            path: 'YourAddress',
            element: <YourAddress />
          },
          {
            path: 'AccountBalance',
            element: <AccountBalance />
          },
          {
            path: 'deployer',
            element: <DeployerPageAptos />
          }
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
