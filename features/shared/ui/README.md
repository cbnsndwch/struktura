# Struktura Shared UI Components

A comprehensive shadcn/ui-based design system for the Struktura platform, providing consistent and accessible React components across all features.

## 🚀 Features

- **shadcn/ui Components**: Full suite of production-ready components
- **Tailwind CSS Integration**: Utility-first CSS with custom design tokens
- **TypeScript Support**: Fully typed components and utilities
- **Sonner Toast System**: Modern toast notifications (no legacy toaster)
- **Dark Mode Ready**: Built-in dark mode support with CSS variables
- **Accessible**: ARIA compliant components using Radix UI primitives
- **Tree Shakeable**: Import only what you need

## 📦 Installation

This package is designed to be used within the Struktura monorepo. For external usage:

```bash
pnpm add @cbnsndwch/struktura-shared-ui
```

### Peer Dependencies

```bash
pnpm add react react-dom
```

## 🎨 Available Components

### Core Components
- **Button** - Versatile button component with multiple variants
- **Card** - Flexible card container with header, content, and footer
- **Input** - Form input with consistent styling
- **Label** - Accessible form labels
- **Select** - Dropdown select component with search
- **Dialog** - Modal dialogs and overlays

### Toast Notifications
- **Toaster** - Modern toast notifications powered by Sonner

### Utilities
- **cn()** - Tailwind class name merger with conflict resolution

## 🔧 Usage

### Basic Import

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from '@cbnsndwch/struktura-shared-ui';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Get Started</Button>
      </CardContent>
    </Card>
  );
}
```

### CSS Import

Make sure to import the CSS in your application root:

```tsx
// In your main app file
import '@cbnsndwch/struktura-shared-ui/dist/globals.css';
```

### Toast Notifications

```tsx
import { Toaster } from '@cbnsndwch/struktura-shared-ui';
import { toast } from 'sonner';

function App() {
  return (
    <div>
      <Toaster />
      <button onClick={() => toast('Hello World!')}>
        Show Toast
      </button>
    </div>
  );
}
```

## 🎨 Theming

The design system uses CSS custom properties for theming:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode overrides */
}
```

### Using the cn() Utility

```tsx
import { cn } from '@cbnsndwch/struktura-shared-ui';

function MyComponent({ className, isActive }) {
  return (
    <div 
      className={cn(
        'base-styles',
        isActive && 'active-styles',
        className
      )}
    >
      Content
    </div>
  );
}
```

## 🏗️ Development

### Building

```bash
pnpm build
```

### Testing

```bash
pnpm test
```

### Linting

```bash
pnpm lint
```

## 📖 Component Documentation

### Button

```tsx
<Button variant="default" size="md">
  Click me
</Button>

// Variants: default, destructive, outline, secondary, ghost, link
// Sizes: default, sm, lg, icon
```

### Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    Footer actions
  </CardFooter>
</Card>
```

### Dialog

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    <p>Dialog content</p>
  </DialogContent>
</Dialog>
```

## 🔮 Migration from Legacy Components

This package maintains backward compatibility with existing theme and utils exports:

```tsx
// Legacy imports still work
import { theme, Utils } from '@cbnsndwch/struktura-shared-ui';

// New shadcn/ui components
import { Button, Card } from '@cbnsndwch/struktura-shared-ui';
```

## 🤝 Contributing

When adding new components:

1. Follow the established shadcn/ui patterns
2. Add proper TypeScript types
3. Include tests for component exports
4. Update this README with usage examples
5. Ensure components are accessible and responsive

## 📄 License

MIT © cbnsndwch LLC