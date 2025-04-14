// src/renderer/contexts/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const ThemeContext = createContext();

// Theme options
export const THEMES = {
  LIGHT: 'vyperLight',
  DARK: 'vyperDark'
};

// Custom hook to use the theme context
export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(THEMES.LIGHT);
  const [loading, setLoading] = useState(true);

  // Initialize theme from storage
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // Get theme from electron store
        const { success, value } = await window.electron.getSettings('theme');
        
        if (success && value) {
          setTheme(value);
          // Apply theme to HTML element
          document.documentElement.setAttribute('data-theme', value);
          if (value === THEMES.DARK) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        } else {
          // Default to light theme if not set
          setTheme(THEMES.LIGHT);
          document.documentElement.setAttribute('data-theme', THEMES.LIGHT);
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {
        console.error('Theme initialization error:', error);
        // Default to light theme on error
        setTheme(THEMES.LIGHT);
        document.documentElement.setAttribute('data-theme', THEMES.LIGHT);
        document.documentElement.classList.remove('dark');
      } finally {
        setLoading(false);
      }
    };

    initializeTheme();
  }, []);

  // Toggle theme
  const toggleTheme = async () => {
    const newTheme = theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    
    // Update state
    setTheme(newTheme);
    
    // Update HTML element
    document.documentElement.setAttribute('data-theme', newTheme);
    
    if (newTheme === THEMES.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to storage
    await window.electron.storeSettings({ theme: newTheme });
  };

  // Set specific theme
  const setSpecificTheme = async (newTheme) => {
    if (![THEMES.LIGHT, THEMES.DARK].includes(newTheme)) {
      return false;
    }
    
    // Update state
    setTheme(newTheme);
    
    // Update HTML element
    document.documentElement.setAttribute('data-theme', newTheme);
    
    if (newTheme === THEMES.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to storage
    await window.electron.storeSettings({ theme: newTheme });
    return true;
  };

  // Context value
  const value = {
    theme,
    isDarkMode: theme === THEMES.DARK,
    toggleTheme,
    setTheme: setSpecificTheme,
    loading
  };

  return (
    <ThemeContext.Provider value={value}>
      {!loading && children}
    </ThemeContext.Provider>
  );
};