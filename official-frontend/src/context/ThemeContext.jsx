import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';

const ThemeContext = createContext(null);

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';

  try {
    const saved = window.localStorage.getItem('theme');

    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // Storage may be unavailable.
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const applyTheme = (theme) => {
  const root = document.documentElement;

  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useLayoutEffect(() => {
    applyTheme(theme);

    try {
      window.localStorage.setItem('theme', theme);
    } catch {
      // Storage may be unavailable.
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((previous) => (previous === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside a ThemeProvider');
  }

  return context;
};
