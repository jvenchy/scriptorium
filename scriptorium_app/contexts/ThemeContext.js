import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// App.js
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ScriptoriumLayout from './ScriptoriumLayout';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ScriptoriumLayout />
      </ThemeProvider>
    </AuthProvider>
  );
}