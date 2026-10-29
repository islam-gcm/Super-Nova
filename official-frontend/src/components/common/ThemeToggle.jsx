import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`
        flex h-10 w-10 items-center justify-center rounded-full
        transition-[transform,background-color,color] duration-200
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-blue-500 focus-visible:ring-offset-2
        dark:focus-visible:ring-offset-slate-950
        ${
          isDark
            ? 'bg-gray-800 text-white hover:bg-gray-700'
            : 'border border-purple-100 bg-purple-50 text-purple-950 hover:bg-purple-100'
        }
      `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-white" />
      ) : (
        <Moon className="h-5 w-5 text-purple-950" />
      )}
    </button>
  );
};

export default ThemeToggle;