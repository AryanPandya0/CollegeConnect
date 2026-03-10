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
              style: {
                background: '#1F2937',
                color: '#fff',
                border: '1px solid #374151',
              },
            }} />
          </PostProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
