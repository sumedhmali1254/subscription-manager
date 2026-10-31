import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from 'sonner';

const AppContent = () => {
  const { theme } = useTheme();

  return (
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          richColors
          theme={theme}
          closeButton
          toastOptions={{
            style: {
              borderRadius: '12px',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '13px',
            },
          }}
        />
      </NotificationProvider>
    </AuthProvider>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;

