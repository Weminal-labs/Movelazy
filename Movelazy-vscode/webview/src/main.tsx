import App from './App';
import { createRoot } from 'react-dom/client';
import { Route, MemoryRouter, Routes } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import Aptos from './Pages/aptos/Aptos';
import Foundry from './Pages/sol/Foundry';

const root = createRoot(document.getElementById('root')!);
if (root) {
  root.render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<App />} />
          <Route path="aptos/*" element={<Aptos />} />
          <Route path="foundry/*" element={<Foundry />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}
