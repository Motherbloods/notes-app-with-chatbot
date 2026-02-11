import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
            aria-label="Toggle theme"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? (
                <Sun size={20} style={{ color: 'var(--color-text-primary)' }} />
            ) : (
                <Moon size={20} style={{ color: 'var(--color-text-primary)' }} />
            )}
        </button>
    );
}

export default ThemeToggle;