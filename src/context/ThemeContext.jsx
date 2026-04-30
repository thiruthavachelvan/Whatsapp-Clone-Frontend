import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('whatsapp-theme') === 'dark'
  );

  useEffect(() => {
    const html = window.document.documentElement;
    if (darkMode === true) {
      html.classList.add('dark');
      localStorage.setItem('whatsapp-theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('whatsapp-theme', 'light');
    }
    // Also update body just in case
    if (darkMode === true) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
