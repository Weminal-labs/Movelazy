import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import { RootLayout } from './RootLayout'
import HomePage from './home'
//------------------- Solidity imports --------------------- //
import SolPage from './sol'
import CompilerPage from './sol/pages/compiler'
import TesterPage from './sol/pages/tester'
import DeployerPage from './sol/pages/deployer'

//------------------- Aptos imports --------------------- //
import AptosPage from './aptos'
import DeployerPageAptos from './aptos/pages/deployer'
import YourAddress from './aptos/pages/YourAddress'
import AccountBalance from './aptos/pages/AccountBalance'


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
