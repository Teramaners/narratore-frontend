import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // Ensure component is mounted before accessing theme to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      className="p-2 rounded-full bg-purple-800 text-yellow-200 hover:bg-purple-700 dark:bg-purple-800 dark:text-yellow-200 dark:hover:bg-purple-700 light:bg-indigo-100 light:text-indigo-600 light:hover:bg-indigo-200 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </Button>
  );
}
