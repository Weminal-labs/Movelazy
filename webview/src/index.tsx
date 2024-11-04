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
import ProjectPageSol from './sol/pages/project'
//------------------- Aptos imports --------------------- //
import AptosPage from './aptos'
import CompilerAptosPage from './aptos/pages/compiler'
// import TesterAptosPage from './aptos/pages/tester'
// import DeployerAptosPage from './aptos/pages/deployer'
import ProjectPageAptos from './aptos/pages/project'

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
            path: 'project',
            element: <ProjectPageSol />
          },
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
            path: 'project',
            element: <ProjectPageAptos />
          },
          {
            path: 'compiler',
            element: <CompilerAptosPage />
          },
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
