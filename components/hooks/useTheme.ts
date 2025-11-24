import { useEffect, useCallback } from 'react';
import { useAppStore } from '../../store';

export const useTheme = () => {
  const { theme, toggleTheme } = useAppStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const memoizedToggleTheme = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  return { theme, toggleTheme: memoizedToggleTheme };
};
