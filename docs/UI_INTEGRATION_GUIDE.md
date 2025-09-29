# Shared UI Component Integration Guide

This guide documents how to use the integrated shared UI component workspace in the main application and other features.

## 🎯 Integration Status

✅ **COMPLETE** - The main app is fully integrated with the shared UI workspace.

## 📦 Import Patterns

### Basic Component Imports

```tsx
// Primary pattern - import from main package
import { 
    Button, 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle,
    Badge,
    Input,
    Label 
} from '@cbnsndwch/struktura-shared-ui';
```

### Specific Path Imports (Alternative)

```tsx
// Also supported - specific component paths
import { Button } from '@cbnsndwch/struktura-shared-ui/components/ui/button.js';
import { Card, CardContent } from '@cbnsndwch/struktura-shared-ui/components/ui/card.js';
```

### Utility Functions

```tsx
// Import utility functions
import { cn } from '@cbnsndwch/struktura-shared-ui/lib/utils.js';

// Example usage
<div className={cn(
    "base-classes",
    "conditional-classes",
    someCondition && "active-classes"
)} />
```

### CSS Import

CSS is already configured in the main app (`apps/main/app/app.css`):

```css
@import '@cbnsndwch/struktura-shared-ui/globals.css';
```

## 🏗️ Build Configuration

The integration includes:

- ✅ **Workspace dependency** in `apps/main/package.json`
- ✅ **Vite configuration** properly resolves workspace dependencies
- ✅ **TypeScript paths** configured for type resolution
- ✅ **Hot reload** working during development
- ✅ **Tree shaking** optimizes builds by including only used components

## 🧪 Testing the Integration

Visit `/ui-demo` in the main application to see:
- All component types working together
- Utility function integration (cn)
- Visual confirmation of successful integration
- Interactive examples

## 📋 Available Components

### Core Components
- **Button** - Primary, secondary, ghost, outline variants
- **Card** - Container with header, content, footer sections
- **Badge** - Labels and status indicators
- **Input** - Form inputs with consistent styling
- **Label** - Accessible form labels

### Layout Components
- **Separator** - Visual dividers
- **Skeleton** - Loading placeholders
- **Aspect Ratio** - Consistent aspect ratios

### Navigation Components
- **Breadcrumb** - Navigation breadcrumbs
- **Tabs** - Tabbed interfaces
- **Pagination** - Page navigation

### Form Components
- **Form** - Form field management with react-hook-form
- **Checkbox** - Checkboxes with proper states
- **Radio Group** - Radio button groups
- **Select** - Dropdown selectors
- **Switch** - Toggle switches
- **Slider** - Range sliders
- **Textarea** - Multi-line text inputs

### Overlay Components
- **Dialog** - Modal dialogs
- **Alert Dialog** - Confirmation dialogs
- **Sheet** - Side panels
- **Drawer** - Bottom drawers
- **Popover** - Contextual popups
- **Tooltip** - Hover information
- **Hover Card** - Rich hover content

### Data Display
- **Table** - Data tables
- **Alert** - Status messages
- **Avatar** - User avatars
- **Calendar** - Date selection
- **Chart** - Data visualization
- **Progress** - Progress indicators

### Navigation
- **Command** - Command palette
- **Context Menu** - Right-click menus
- **Dropdown Menu** - Action menus
- **Menubar** - Application menus
- **Navigation Menu** - Site navigation

### Advanced Components
- **Accordion** - Expandable content
- **Carousel** - Image/content sliders
- **Collapsible** - Expandable sections
- **Resizable** - Resizable panels
- **Scroll Area** - Custom scrollbars
- **Sidebar** - Application sidebars
- **Toggle** - Toggle buttons
- **Toggle Group** - Toggle button groups

### Toast Notifications
- **Toaster** - Modern toast notifications (uses Sonner)

```tsx
import { Toaster } from '@cbnsndwch/struktura-shared-ui';
import { toast } from 'sonner';

// In your app root
<Toaster />

// To show a toast
toast('Hello World!');
```

## 🔧 Development Workflow

1. **Start dev server**: `pnpm --filter @cbnsndwch/struktura-main dev:react-router`
2. **Make UI changes**: Edit shared UI components or main app files
3. **Hot reload**: Changes appear automatically in browser
4. **Build for production**: `pnpm --filter @cbnsndwch/struktura-main build`

## 📁 File Structure

```
features/shared/ui/
├── src/
│   ├── components/ui/          # All shadcn/ui components
│   ├── hooks/                  # Shared hooks (use-mobile, etc.)
│   ├── lib/                    # Utility functions
│   │   ├── utils.ts           # cn function for class merging
│   │   └── index.ts           # Lib exports
│   ├── globals.css            # Global styles and CSS variables
│   └── index.ts               # Main package exports
├── package.json               # Package configuration with exports
└── vite.config.mts           # Build configuration
```

## ✨ Best Practices

1. **Use the cn utility** for dynamic class names:
   ```tsx
   <div className={cn("base-class", condition && "active-class")} />
   ```

2. **Import from the main package** for better maintainability:
   ```tsx
   // Preferred
   import { Button, Card } from '@cbnsndwch/struktura-shared-ui';
   
   // Avoid unless necessary
   import { Button } from '@cbnsndwch/struktura-shared-ui/components/ui/button.js';
   ```

3. **Use TypeScript** for better development experience:
   ```tsx
   import { ButtonProps } from '@cbnsndwch/struktura-shared-ui';
   
   interface MyButtonProps extends ButtonProps {
     customProp?: string;
   }
   ```

4. **Leverage component composition**:
   ```tsx
   <Card>
     <CardHeader>
       <CardTitle>Title</CardTitle>
     </CardHeader>
     <CardContent>
       Content here
     </CardContent>
   </Card>
   ```

## 🔗 Related Documentation

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router 7](https://reactrouter.com/)

## 🐛 Troubleshooting

### Build Issues
- Ensure shared UI workspace is built: `pnpm --filter @cbnsndwch/struktura-shared-ui build`
- Clear Vite cache: `rm -rf node_modules/.vite`

### Import Issues  
- Check TypeScript paths in `tsconfig.json`
- Verify package exports in `features/shared/ui/package.json`

### Styling Issues
- Ensure global CSS is imported in `app.css`
- Check for conflicting Tailwind classes
- Use `cn()` utility for conditional classes

---

The shared UI integration provides a solid foundation for consistent, accessible, and maintainable user interfaces across the Struktura platform.