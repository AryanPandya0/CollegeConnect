import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PostProvider } from './context/PostContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes/AppRoutes';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <PostProvider>
            <AppRoutes />
            <Toaster position="bottom-right" toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(26, 40, 45, 0.9)',
                backdropFilter: 'blur(12px)',
                color: '#d7dadc',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                padding: '12px 20px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
              },
              success: {
                iconTheme: {
                  primary: '#ff4500',
                  secondary: '#fff',
                },
              },
            }} />
          </PostProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
