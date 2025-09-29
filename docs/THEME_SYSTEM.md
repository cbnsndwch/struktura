# Struktura Theme System Documentation

## Overview

The Struktura theme system provides comprehensive support for light and dark modes with smooth transitions, system preference detection, and persistent user preferences. It's built on top of shadcn/ui's CSS variable approach using the OKLCH color space.

## Features

✅ **Three-state theme system** (light, dark, system)  
✅ **System preference detection** via `prefers-color-scheme`  
✅ **LocalStorage persistence** across browser sessions  
✅ **Smooth CSS transitions** (0.3s) between theme changes  
✅ **CSS custom properties** using OKLCH color space  
✅ **SSR-safe implementation** prevents theme flashing  
✅ **React context** for theme state management  
✅ **Multiple toggle components** (dropdown and simple toggle)

## Implementation

### 1. Theme Provider Setup

The theme system is automatically initialized in the main app's `root.tsx`:

```tsx
import { ThemeProvider } from '@cbnsndwch/struktura-shared-ui';

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {/* Theme script prevents flashing */}
                <ThemeScript />
            </head>
            <body>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
```

### 2. Using Theme Components

#### ThemeToggle (Dropdown)
Full-featured dropdown with all three theme options:

```tsx
import { ThemeToggle } from '@cbnsndwch/struktura-shared-ui';

function Header() {
    return (
        <div className="flex justify-end">
            <ThemeToggle />
        </div>
    );
}
```

#### SimpleThemeToggle (Binary)
Simple light/dark toggle button:

```tsx
import { SimpleThemeToggle } from '@cbnsndwch/struktura-shared-ui';

function Toolbar() {
    return (
        <div className="toolbar">
            <SimpleThemeToggle />
        </div>
    );
}
```

### 3. Using Theme State

Access theme state in any component:

```tsx
import { useTheme } from '@cbnsndwch/struktura-shared-ui';

function MyComponent() {
    const { theme, setTheme, resolvedTheme } = useTheme();

    return (
        <div>
            <p>Current theme preference: {theme}</p>
            <p>Resolved theme: {resolvedTheme}</p>
            
            <button onClick={() => setTheme('dark')}>
                Switch to Dark
            </button>
        </div>
    );
}
```

## CSS Variables

The theme system uses CSS custom properties defined in both light and dark variants:

### Light Mode (Default)
```css
:root {
    --background: oklch(1 0 0);
    --foreground: oklch(0.145 0 0);
    --primary: oklch(0.205 0 0);
    --primary-foreground: oklch(0.985 0 0);
    /* ... more variables */
}
```

### Dark Mode
```css
.dark {
    --background: oklch(0.145 0 0);
    --foreground: oklch(0.985 0 0);
    --primary: oklch(0.985 0 0);
    --primary-foreground: oklch(0.205 0 0);
    /* ... more variables */
}
```

## Theme-Aware Styling

Use semantic color tokens for consistent theming:

```tsx
// ✅ Good - Uses semantic tokens
<div className="bg-background text-foreground">
    <h1 className="text-primary">Title</h1>
    <p className="text-muted-foreground">Subtitle</p>
</div>

// ❌ Avoid - Hard-coded colors
<div className="bg-white text-black dark:bg-black dark:text-white">
    <h1 className="text-blue-600">Title</h1>
</div>
```

## Transitions

Smooth transitions are automatically applied to theme-aware properties:

```css
/* Applied automatically to themed elements */
*,
*::before,
*::after {
    transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

/* Interactive elements have faster transitions */
input, textarea, select, button, [role="button"] {
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
```

## Theme States

### Light Mode
- **When**: User selects "light" or system preference is light
- **CSS Class**: `html.light`
- **Storage**: `localStorage['struktura-theme'] = 'light'`

### Dark Mode  
- **When**: User selects "dark" or system preference is dark
- **CSS Class**: `html.dark`
- **Storage**: `localStorage['struktura-theme'] = 'dark'`

### System Mode (Auto)
- **When**: User selects "system" (default)
- **CSS Class**: `html.light` or `html.dark` (based on system)
- **Storage**: `localStorage['struktura-theme'] = 'system'`
- **Detection**: `window.matchMedia('(prefers-color-scheme: dark)')`

## SSR Considerations

The theme system is SSR-safe with these features:

1. **Theme Script**: Inline script in `<head>` applies theme class before React hydration
2. **suppressHydrationWarning**: Prevents hydration warnings for theme-dependent content
3. **Fallback Values**: All CSS variables have sensible light mode defaults

```tsx
// Theme script prevents flashing
function ThemeScript() {
    const themeScript = `
        (function() {
            const theme = localStorage.getItem('struktura-theme') || 'system';
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            const resolvedTheme = theme === 'system' ? systemTheme : theme;
            document.documentElement.classList.add(resolvedTheme);
        })();
    `;
    
    return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
```

## API Reference

### useTheme Hook

```typescript
interface ThemeContextValue {
    theme: 'light' | 'dark' | 'system';
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    resolvedTheme: 'light' | 'dark';
}

const { theme, setTheme, resolvedTheme } = useTheme();
```

### Theme Components

```typescript
// Full dropdown toggle
<ThemeToggle />

// Simple binary toggle  
<SimpleThemeToggle />

// Theme provider (required at app root)
<ThemeProvider>{children}</ThemeProvider>
```

## Customization

### Adding Custom Colors

Extend the CSS variables in your theme files:

```css
:root {
    /* Existing variables */
    --background: oklch(1 0 0);
    
    /* Custom variables */
    --custom-accent: oklch(0.7 0.15 200);
    --custom-accent-foreground: oklch(0.98 0 0);
}

.dark {
    /* Dark mode overrides */
    --custom-accent: oklch(0.4 0.15 200);
    --custom-accent-foreground: oklch(0.95 0 0);
}
```

### Custom Theme Toggle

Create your own theme toggle component:

```tsx
import { useTheme } from '@cbnsndwch/struktura-shared-ui';

function CustomThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    
    return (
        <button 
            onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
            {resolvedTheme === 'light' ? '🌙' : '☀️'}
        </button>
    );
}
```

## Troubleshooting

### Theme Not Persisting
- Check that localStorage is available and not blocked
- Verify the `ThemeProvider` wraps your app root
- Ensure the theme script is included in `<head>`

### Theme Flashing on Page Load
- Make sure the theme script runs before React hydration
- Add `suppressHydrationWarning` to theme-dependent elements
- Verify CSS variables have proper defaults

### Transitions Not Working
- Check that CSS custom properties are being used correctly
- Verify transition styles are not being overridden
- Use semantic color tokens instead of hard-coded colors

## Browser Support

The theme system requires:
- **CSS Custom Properties**: All modern browsers
- **CSS Media Queries**: `prefers-color-scheme` support
- **localStorage**: For theme persistence
- **classList API**: For dynamic theme switching

Gracefully degrades to light mode in unsupported browsers.