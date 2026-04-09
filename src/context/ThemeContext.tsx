/**
 * ThemeContext — manages light/dark theme.
 *
 * tokens.json is the single source of truth for all color values.
 * On every theme change, ThemeContext writes each token as a CSS custom
 * property onto <html> so every component can use var(--token-name).
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import tokens from '../tokens.json';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Apply all color tokens for the given theme to document.documentElement */
function applyTokens(theme: Theme): void {
  const map = tokens[theme] as Record<string, string>;
  Object.entries(map).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, value);
  });
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // User's saved preference wins; fallback to OS preference
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    applyTokens(theme);
    // Keep data-theme on <html> for any CSS that still needs it
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
