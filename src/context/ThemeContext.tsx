import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ThemeConfig } from '../types';

interface ThemeContextType {
  theme: ThemeConfig;
  toggleTheme: () => void;
  setPrimaryColor: (color: string) => void;
}

const defaultTheme: ThemeConfig = {
  mode: 'light',
  primaryColor: '#0ea5e9', // primary-500
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const savedTheme = localStorage.getItem('flashcards-theme');
    return savedTheme ? JSON.parse(savedTheme) : defaultTheme;
  });

  // Apply theme effect
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('flashcards-theme', JSON.stringify(theme));
    
    // Apply theme to document
    if (theme.mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Set primary color CSS variable
    document.documentElement.style.setProperty('--color-primary', hexToRgb(theme.primaryColor));
    
    // Force a re-render of the theme by toggling a class
    document.documentElement.classList.add('theme-updated');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-updated');
    }, 10);
  }, [theme]);

  // Check system preference on mount
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // If no saved theme, use system preference
    if (!localStorage.getItem('flashcards-theme')) {
      const systemPrefersDark = mediaQuery.matches;
      setTheme(prev => ({
        ...prev,
        mode: systemPrefersDark ? 'dark' : 'light'
      }));
    }
    
    // Listen for system preference changes
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      if (!localStorage.getItem('flashcards-theme-user-set')) {
        setTheme(prev => ({
          ...prev,
          mode: e.matches ? 'dark' : 'light'
        }));
      }
    };
    
    try {
      // Modern API (newer browsers)
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (e) {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange as any);
      return () => mediaQuery.removeListener(handleChange as any);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const newMode = prev.mode === 'light' ? 'dark' : 'light';
      
      // Mark that user has explicitly set a preference
      localStorage.setItem('flashcards-theme-user-set', 'true');
      
      return {
        ...prev,
        mode: newMode
      };
    });
  };

  const setPrimaryColor = (color: string) => {
    setTheme(prev => ({
      ...prev,
      primaryColor: color
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper function to convert hex color to RGB format
function hexToRgb(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r} ${g} ${b}`;
} 