import React, { createContext, useContext, useState } from 'react';

interface ThemeColors {
  background: string;
  text: string;
  iconColor: string;
  cardBackground: string;
  border: string;
  hover: string;
}

interface Theme {
  isDarkMode: boolean;
  colors: ThemeColors;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme: Theme = {
    isDarkMode,
    colors: isDarkMode ? {
      background: '#1a1b2e',
      text: '#ffffff',
      iconColor: '#ffffff',
      cardBackground: '#2a2b3d',
      border: '#3a3b4d',
      hover: '#2a2b3d'
    } : {
      background: '#ffffff',
      text: '#000000',
      iconColor: '#000000',
      cardBackground: '#ffffff',
      border: '#e0e0e0',
      hover: '#f5f5f5'
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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