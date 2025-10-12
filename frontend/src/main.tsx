import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; // Import the CartProvider
import './i18n';
import { Toaster } from 'react-hot-toast';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider> {/* Add CartProvider here */}
        <AppRouter />
        {/* ✅ Add Toaster here (once, globally) */}
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              borderRadius: '10px',
              background: '#A52A2A',
              color: '#fff',
            },
          }} 
        />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
);