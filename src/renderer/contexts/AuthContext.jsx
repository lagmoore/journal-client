// src/renderer/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { decodeToken, isTokenExpired, getTimeUntilExpiry } from '../utils/tokenUtils';
import { useTranslation } from 'react-i18next';

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [tokenRefreshTimeoutId, setTokenRefreshTimeoutId] = useState(null);
  const navigate = useNavigate(); // This hook must be used inside a Router context
  const { t } = useTranslation();

  // Clear refresh timeout on component unmount
  useEffect(() => {
    return () => {
      if (tokenRefreshTimeoutId) {
        clearTimeout(tokenRefreshTimeoutId);
      }
    };
  }, [tokenRefreshTimeoutId]);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get user ID from localStorage (not secure, but needed for keytar lookup)
        const userId = localStorage.getItem('userId');
        
        if (userId) {
          // For development, we'll mock this since we can't use Electron APIs directly in development
          // In production, this would use window.electron.getTokens
          let storedRefreshToken;
          
          // Check if we're in Electron context
          if (window.electron) {
            // Use secure Electron storage
            const { success, refreshToken, error } = 
              await window.electron.getTokens({ userId });
            
            if (success && refreshToken) {
              storedRefreshToken = refreshToken;
            }
          } else {
            // In development, fallback to localStorage (NOT secure for production)
            storedRefreshToken = localStorage.getItem('refreshToken');
          }
          
          if (storedRefreshToken) {
            // Attempt to refresh the access token using the stored refresh token
            setRefreshToken(storedRefreshToken);
            
            // In development, mock the refresh token behavior
            // In production, this would call the actual API
            try {
              // Mock successful token refresh for development
              const mockDecodedToken = {
                userId: parseInt(userId),
                username: 'testuser',
                role: 'admin'
              };
              
              setCurrentUser({
                id: mockDecodedToken.userId,
                username: mockDecodedToken.username,
                role: mockDecodedToken.role
              });
              
              // Create a mock access token that will expire in 60 minutes
              const mockAccessToken = 'mock_access_token';
              setAccessToken(mockAccessToken);
              
              // Schedule token refresh
              const timeoutId = setTimeout(() => {
                console.log('Mock token refresh');
              }, 55 * 60 * 1000); // 55 minutes
              
              setTokenRefreshTimeoutId(timeoutId);
            } catch (error) {
              console.error('Auth refresh error:', error);
              await logout();
            }
          } else {
            // If no refresh token, clear auth state
            await logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        toast.error(t('auth.errors.initialization'));
        await logout();
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Function to refresh the access token
  const refreshAccessToken = useCallback(async (currentRefreshToken) => {
    try {
      // Here you would use the actual API in production
      if (window.electron) {
        // Production code
        const response = await api.post('/auth/refresh-token', {
          refreshToken: currentRefreshToken,
        });

        if (response.data.success) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
          
          // Update state with new tokens
          setAccessToken(newAccessToken);
          setRefreshToken(newRefreshToken);
          
          // Store new refresh token securely
          if (currentUser && currentUser.id) {
            await window.electron.storeTokens({
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
              userId: currentUser.id,
            });
          }
          
          return { success: true, accessToken: newAccessToken };
        }
      } else {
        // Development mock
        console.log('Development mock: Refreshing token');
        return { success: true, accessToken: 'new_mock_access_token' };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, error };
    }
  }, [currentUser]);

  // Schedule token refresh before it expires
  const scheduleTokenRefresh = useCallback((token) => {
    if (tokenRefreshTimeoutId) {
      clearTimeout(tokenRefreshTimeoutId);
    }

    if (!token) return;

    // In production, would use actual token expiry
    const timeUntilExpiry = 55 * 60 * 1000; // 55 minutes
    
    // Schedule refresh
    const timeoutId = setTimeout(async () => {
      if (refreshToken) {
        const result = await refreshAccessToken(refreshToken);
        if (result.success) {
          scheduleTokenRefresh(result.accessToken);
        } else {
          await logout();
        }
      }
    }, timeUntilExpiry);
    
    setTokenRefreshTimeoutId(timeoutId);
  }, [refreshToken, refreshAccessToken, tokenRefreshTimeoutId]);

  // Login function
  const login = async (email, password, rememberMe) => {
    try {
      // In production, this would call the actual API
      if (window.electron) {
        const response = await api.post('/auth/login', {
          email,
          password,
        });

        if (response.data.success) {
          const { accessToken, refreshToken, user } = response.data;
          
          // Store user info
          setCurrentUser(user);
          setAccessToken(accessToken);
          setRefreshToken(refreshToken);
          
          // Store user ID in localStorage for keytar lookup
          localStorage.setItem('userId', user.id);
          
          // If remember me is checked, store refresh token
          if (rememberMe) {
            await window.electron.storeTokens({
              accessToken,
              refreshToken,
              userId: user.id,
            });
          }
          
          // Schedule token refresh
          scheduleTokenRefresh(accessToken);
          
          // Return success
          return { success: true };
        } else {
          return { 
            success: false,
            error: response.data.message || t('auth.errors.invalidCredentials')
          };
        }
      } else {
        // Development mock login
        console.log('Development mock: Logging in with', email);
        
        // Mock user
        const mockUser = {
          id: 1,
          username: email.split('@')[0],
          email: email,
          role: 'admin'
        };
        
        // Store mock tokens
        const mockAccessToken = 'mock_access_token';
        const mockRefreshToken = 'mock_refresh_token';
        
        setCurrentUser(mockUser);
        setAccessToken(mockAccessToken);
        setRefreshToken(mockRefreshToken);
        
        // Store ID for retrieval
        localStorage.setItem('userId', mockUser.id);
        
        // If remember me, store refresh token
        if (rememberMe) {
          localStorage.setItem('refreshToken', mockRefreshToken);
        }
        
        // Schedule mock refresh
        const timeoutId = setTimeout(() => {
          console.log('Mock token refresh');
        }, 55 * 60 * 1000); // 55 minutes
        
        setTokenRefreshTimeoutId(timeoutId);
        
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || t('auth.errors.loginFailed')
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear refresh timeout
      if (tokenRefreshTimeoutId) {
        clearTimeout(tokenRefreshTimeoutId);
      }
      
      // Clear auth state
      setCurrentUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      
      // Get user ID from localStorage
      const userId = localStorage.getItem('userId');
      
      // Clear tokens from secure storage
      if (userId) {
        if (window.electron) {
          await window.electron.deleteTokens({ userId });
        } else {
          // Development mock
          localStorage.removeItem('refreshToken');
        }
      }
      
      // Remove user ID from localStorage
      localStorage.removeItem('userId');
      
      // If already logged in, notify API of logout
      if (refreshToken && window.electron) {
        try {
          await api.post('/auth/logout', { refreshToken });
        } catch (error) {
          console.error('Error logging out from API:', error);
          // Continue with local logout even if API logout fails
        }
      }
      
      // Redirect to login page
      navigate('/login');
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error };
    }
  };

  // Request password reset
  const requestPasswordReset = async (email) => {
    try {
      if (window.electron) {
        const response = await api.post('/auth/request-password-reset', { email });
        return { 
          success: response.data.success, 
          message: response.data.message 
        };
      } else {
        // Development mock
        console.log('Development mock: Requesting password reset for', email);
        return { 
          success: true, 
          message: 'If your email is registered, you will receive a password reset link.' 
        };
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || t('auth.errors.resetRequestFailed')
      };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!currentUser && !!accessToken;

  // Context value
  const value = {
    currentUser,
    accessToken,
    loading,
    initialized,
    isAuthenticated,
    login,
    logout,
    refreshAccessToken,
    requestPasswordReset,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};