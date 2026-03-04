import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 'classic-pink' | 'midnight-swan' | 'forest-giselle';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'classic-pink', setTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

export const themeLabels: Record<ThemeName, string> = {
  'classic-pink': '🩰 Classic Pink',
  'midnight-swan': '🦢 Midnight Swan',
  'forest-giselle': '🌿 Forest Giselle',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    return (localStorage.getItem('ballet-theme') as ThemeName) || 'classic-pink';
  });

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem('ballet-theme', t);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-classic-pink', 'theme-midnight-swan', 'theme-forest-giselle', 'dark');
    root.classList.add(`theme-${theme}`);
    if (theme === 'midnight-swan') {
      root.classList.add('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
