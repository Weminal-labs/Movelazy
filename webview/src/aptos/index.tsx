import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AptosNavbar } from './components/AptosNavbar';
import { useState, useEffect } from 'react';

interface WorkspaceStatus {
  loading: boolean;
  initialized?: boolean;
  error?: string;
}

const AptosPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<WorkspaceStatus>({ loading: true });

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;

      switch (message.type) {
        case 'settings':
          setStatus({
            loading: false,
            initialized: true
          });
          if (location.pathname === '/aptos') {
            navigate('/aptos/project');
          }
          break;
        case 'workspaceStatus':
          setStatus({
            loading: message.loading,
            initialized: message.initialized,
            error: message.error
          });
          break;
      }
    };
    window.addEventListener('message', messageHandler);
    if (window.vscode) {
      window.vscode.postMessage({ command: 'aptos.getSettings' });
    }

    return () => window.removeEventListener('message', messageHandler);
  }, [navigate, location]);

  useEffect(() => {
    if (!status.loading && !status.initialized && location.pathname === '/aptos/compiler') {
      navigate('/aptos/project');
    }
  }, [status, navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-[#0e0f0e]">
      <AptosNavbar />
      <main className="p-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AptosPage;