import React, { createContext, useState, useEffect, useCallback } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize state from localStorage or default to dark
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('whatsapp-theme');
    const initialMode = stored !== null ? stored === 'dark' : true;
    console.log('[Theme] Initial mode:', initialMode ? 'dark' : 'light');
    return initialMode;
  });

  // Apply theme class to document element
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
      localStorage.setItem('whatsapp-theme', 'dark');
      console.log('[Theme] Applied dark mode');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('whatsapp-theme', 'light');
      console.log('[Theme] Applied light mode');
    }
  }, [darkMode]);

  const toggleTheme = useCallback(() => {
    setDarkMode(prev => {
      const newMode = !prev;
      console.log('[Theme] Toggling to:', newMode ? 'dark' : 'light');
      return newMode;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
