import * as React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

import { Button } from './button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from './dropdown-menu';
import { useTheme } from '../../hooks/use-theme';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="transition-colors">
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => setTheme('light')}
                    className="cursor-pointer"
                >
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                    {theme === 'light' && <span className="ml-auto text-xs">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme('dark')}
                    className="cursor-pointer"
                >
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                    {theme === 'dark' && <span className="ml-auto text-xs">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme('system')}
                    className="cursor-pointer"
                >
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>System</span>
                    {theme === 'system' && <span className="ml-auto text-xs">✓</span>}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function SimpleThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="transition-colors"
        >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}