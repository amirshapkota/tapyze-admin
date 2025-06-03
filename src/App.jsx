import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { PageProvider } from './contexts/PageContext';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import { useAuth } from './contexts/AuthContext';
import './styles/index.css';

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return <Layout />;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <PageProvider>
            <AppContent />
          </PageProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;