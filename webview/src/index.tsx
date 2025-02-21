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
import TesterAptosPage from './aptos/pages/tester'
import DeployerAptosPage from './aptos/pages/deployer'
import ProjectPageAptos from './aptos/pages/project'
import CliNotFound from './aptos/pages/installation/cli-not-found'
import LinuxInstallationGuide from './aptos/pages/installation/Linux'
import MacInstallationGuide from './aptos/pages/installation/Mac'
import WindowsInstallationGuide from './aptos/pages/installation/Window'
import SpecificInstallationGuide from './aptos/pages/installation/SpecificVersion'
import AptosInitForm from './aptos/pages/aptos_init'
import AptosHelp from './aptos/pages/aptos_help'

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
            path: 'cli-not-found',
            element: <CliNotFound />,
          },
          {
            path: 'mac',
            element: <MacInstallationGuide />
          },
          {
            path: 'linux',
            element: <LinuxInstallationGuide />
          },
          {
            path: 'windows',
            element: <WindowsInstallationGuide />
          },
          {
            path: 'init',
            element: <AptosInitForm />
          },
          {
            path: 'help',
            element: <AptosHelp />
          },
          {
            path: 'specific-version',
            element: <SpecificInstallationGuide />
          },
          {
            path: 'project',
            element: <ProjectPageAptos />
          },
          {
            path: 'compiler',
            element: <CompilerAptosPage />
          },
          {
            path: 'tester',
            element: <TesterAptosPage />
          },
          {
            path: 'deployer',
            element: <DeployerAptosPage />
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
