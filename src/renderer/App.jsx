// src/renderer/App.jsx
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { initI18n } from './utils/i18n';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Views
import LoginView from './views/LoginView';
import ForgotPasswordView from './views/ForgotPasswordView';
import ErrorView from './views/ErrorView';
import DashboardView from './views/DashboardView';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Initialize i18n on app start
  useEffect(() => {
    const initializeApp = async () => {
      await initI18n();
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      {/* Router must come before AuthProvider because AuthProvider uses useNavigate */}
      <Router>
        <AuthProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              // Toast styling that matches our theme
              style: {
                border: '1px solid #e2e8f0',
                padding: '16px',
                color: '#1e293b',
              },
              // Different styles for different toast types
              success: {
                style: {
                  background: '#f0fdf4',
                  borderColor: '#bbf7d0',
                  color: '#166534',
                },
              },
              error: {
                style: {
                  background: '#fef2f2',
                  borderColor: '#fecaca',
                  color: '#b91c1c',
                },
              },
              loading: {
                style: {
                  background: '#f8fafc',
                  borderColor: '#e2e8f0',
                  color: '#1e293b',
                },
              },
            }}
          />
          
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route path="/forgot-password" element={<ForgotPasswordView />} />
            <Route path="/error" element={<ErrorView />} />
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <DashboardView />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/error" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;