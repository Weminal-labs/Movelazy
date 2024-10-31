import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import './styles/index.css'
import { RootLayout } from './RootLayout'
import SolPage from './Pages/sol'
import HomePage from './Pages/home'


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
          // Các nested routes của Sol có thể thêm ở đây
        ]
      },
/*       {
        path: 'aptos',
        element: <AptosPage />,
        children: [
          // Các nested routes của Aptos có thể thêm ở đây
        ]
      } */
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
