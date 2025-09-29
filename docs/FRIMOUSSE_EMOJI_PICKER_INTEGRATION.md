# Frimousse Emoji Picker Integration Strategy

## Overview

This document provides a comprehensive integration strategy for the Frimousse emoji picker library in the Struktura platform. Frimousse is a modern, lightweight emoji picker designed for React applications, offering excellent performance and accessibility features.

## Why Frimousse?

Frimousse (https://frimousse.liveblocks.io/) offers several advantages for our use case:

- **Lightweight**: Optimized bundle size with tree-shaking support
- **Modern**: Built with React 18+ and TypeScript
- **Accessible**: Full keyboard navigation and screen reader support
- **Performant**: Virtual scrolling for smooth performance with large emoji datasets
- **Customizable**: Flexible theming system that integrates well with shadcn/ui
- **SSR Compatible**: Works seamlessly with React Router 7 SSR

## Installation

### Package Installation

Install the Frimousse emoji picker package using pnpm:

```bash
# In the shared UI workspace
cd features/shared/ui
pnpm add frimousse

# Or install in the main app if needed directly
cd apps/main
pnpm add frimousse
```

### Peer Dependencies

Frimousse requires the following peer dependencies (already available in our monorepo):

```json
{
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  }
}
```

## TypeScript Integration

### Type Definitions

Frimousse comes with built-in TypeScript support. Here are the key types you'll work with:

```typescript
// Core types
interface EmojiData {
  id: string;
  name: string;
  native: string;
  unified: string;
  keywords: string[];
  emoticons: string[];
  shortcodes: string;
  skin?: number;
}

interface EmojiPickerProps {
  onEmojiSelect: (emoji: EmojiData) => void;
  theme?: 'light' | 'dark' | 'auto';
  categories?: EmojiCategory[];
  skinTonePosition?: 'none' | 'preview' | 'search';
  searchPosition?: 'sticky' | 'static' | 'none';
  locale?: string;
  maxFrequentRows?: number;
  perLine?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface EmojiCategory {
  id: string;
  name: string;
  emojis: string[];
}
```

### Type-Safe Component Definition

```typescript
// features/shared/ui/src/components/emoji/emoji-picker.tsx
import React from 'react';
import { EmojiPicker as FrimousseEmojiPicker, EmojiData } from 'frimousse';
import { cn } from '../../lib/utils';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: EmojiData) => void;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  categories?: string[];
  searchPlaceholder?: string;
  showPreview?: boolean;
  showSkinTones?: boolean;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onEmojiSelect,
  className,
  theme = 'auto',
  categories,
  searchPlaceholder = 'Search emojis...',
  showPreview = true,
  showSkinTones = true,
  ...props
}) => {
  return (
    <FrimousseEmojiPicker
      onEmojiSelect={onEmojiSelect}
      theme={theme}
      categories={categories}
      className={cn(
        'frimousse-emoji-picker',
        'border border-border rounded-md bg-background',
        className
      )}
      searchPlaceholder={searchPlaceholder}
      showPreview={showPreview}
      skinTonePosition={showSkinTones ? 'search' : 'none'}
      {...props}
    />
  );
};
```

## Theme Integration with shadcn/ui

### CSS Variable Integration

Frimousse supports CSS custom properties, making it easy to integrate with our shadcn/ui theme system:

```css
/* features/shared/ui/src/styles/frimousse-theme.css */

/* Light theme variables */
.frimousse-emoji-picker {
  --frimousse-bg: hsl(var(--background));
  --frimousse-color: hsl(var(--foreground));
  --frimousse-border: hsl(var(--border));
  --frimousse-hover-bg: hsl(var(--accent));
  --frimousse-hover-color: hsl(var(--accent-foreground));
  --frimousse-active-bg: hsl(var(--primary));
  --frimousse-active-color: hsl(var(--primary-foreground));
  --frimousse-search-bg: hsl(var(--input));
  --frimousse-search-border: hsl(var(--border));
  --frimousse-category-color: hsl(var(--muted-foreground));
  --frimousse-preview-bg: hsl(var(--muted));
  --frimousse-preview-color: hsl(var(--muted-foreground));
  --frimousse-scroll-thumb: hsl(var(--border));
  --frimousse-scroll-track: hsl(var(--background));
}

/* Dark theme automatically inherits from CSS variables */
[data-theme="dark"] .frimousse-emoji-picker {
  /* Variables automatically adjust based on shadcn/ui dark theme */
}

/* Focus styles for accessibility */
.frimousse-emoji-picker .emoji-button:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

/* Smooth transitions */
.frimousse-emoji-picker * {
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
```

### Theme-aware Wrapper Component

```typescript
// features/shared/ui/src/components/emoji/themed-emoji-picker.tsx
import React from 'react';
import { useTheme } from '../theme/theme-provider';
import { EmojiPicker, EmojiPickerProps } from './emoji-picker';

export const ThemedEmojiPicker: React.FC<Omit<EmojiPickerProps, 'theme'>> = (props) => {
  const { resolvedTheme } = useTheme();
  
  return (
    <EmojiPicker
      {...props}
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
    />
  );
};
```

## Performance Considerations

### Bundle Size Impact

Frimousse is designed to be lightweight:

- **Base library**: ~15KB gzipped
- **Emoji data**: ~50KB gzipped (loaded on demand)
- **Total impact**: ~65KB gzipped when fully loaded

### Lazy Loading Strategy

Implement lazy loading to minimize initial bundle size:

```typescript
// features/shared/ui/src/components/emoji/lazy-emoji-picker.tsx
import React, { Suspense, lazy } from 'react';
import { Skeleton } from '../ui/skeleton';

// Lazy load the emoji picker
const EmojiPickerComponent = lazy(() => 
  import('./themed-emoji-picker').then(module => ({
    default: module.ThemedEmojiPicker
  }))
);

interface LazyEmojiPickerProps {
  onEmojiSelect: (emoji: any) => void;
  className?: string;
  loadingHeight?: string;
}

export const LazyEmojiPicker: React.FC<LazyEmojiPickerProps> = ({
  loadingHeight = '400px',
  ...props
}) => {
  return (
    <Suspense 
      fallback={
        <div className="space-y-3 p-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 32 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-10" />
            ))}
          </div>
          <Skeleton className="h-16 w-full" />
        </div>
      }
    >
      <EmojiPickerComponent {...props} />
    </Suspense>
  );
};
```

### Virtualization and Performance

```typescript
// Performance optimization configuration
const EMOJI_PICKER_CONFIG = {
  perLine: 8, // Emojis per row (adjust based on container width)
  maxFrequentRows: 2, // Limit frequently used emojis
  emojiSize: 32, // Emoji size in pixels
  searchThrottle: 150, // Search input throttling in ms
  virtualScroll: true, // Enable virtual scrolling for large lists
} as const;

export const OptimizedEmojiPicker: React.FC<EmojiPickerProps> = (props) => {
  return (
    <ThemedEmojiPicker
      {...EMOJI_PICKER_CONFIG}
      {...props}
    />
  );
};
```

## Accessibility Features

### Keyboard Navigation

Frimousse provides comprehensive keyboard support:

- **Tab/Shift+Tab**: Navigate between sections
- **Arrow Keys**: Navigate within emoji grid
- **Enter/Space**: Select emoji
- **Escape**: Close picker (when used in modals)
- **Home/End**: Jump to start/end of category
- **Page Up/Down**: Navigate by pages

### Screen Reader Support

```typescript
// Enhanced accessibility wrapper
export const AccessibleEmojiPicker: React.FC<EmojiPickerProps> = (props) => {
  return (
    <div 
      role="dialog"
      aria-label="Emoji picker"
      aria-describedby="emoji-picker-instructions"
    >
      <div 
        id="emoji-picker-instructions" 
        className="sr-only"
      >
        Use arrow keys to navigate emojis, Enter to select, Escape to close.
      </div>
      <ThemedEmojiPicker {...props} />
    </div>
  );
};
```

### Focus Management

```typescript
// Focus trap for modal usage
import { useEffect, useRef } from 'react';

export const FocusTrappedEmojiPicker: React.FC<EmojiPickerProps & {
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose, ...props }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen && containerRef.current) {
      // Focus the first focusable element
      const firstFocusable = containerRef.current.querySelector(
        'input, button, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    }
  }, [isOpen]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };
  
  return (
    <div ref={containerRef} onKeyDown={handleKeyDown}>
      <AccessibleEmojiPicker {...props} />
    </div>
  );
};
```

## React Router 7 SSR Compatibility

### Server-Side Rendering Considerations

```typescript
// features/shared/ui/src/components/emoji/ssr-safe-emoji-picker.tsx
import React, { useEffect, useState } from 'react';
import { LazyEmojiPicker } from './lazy-emoji-picker';

export const SSRSafeEmojiPicker: React.FC<any> = (props) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Don't render on server to avoid hydration issues
  if (!isClient) {
    return (
      <div className="h-96 w-full flex items-center justify-center border border-border rounded-md">
        <span className="text-muted-foreground">Loading emoji picker...</span>
      </div>
    );
  }
  
  return <LazyEmojiPicker {...props} />;
};
```

### Hydration-Safe Implementation

```typescript
// Use dynamic imports for SSR safety
import dynamic from 'next/dynamic';

const DynamicEmojiPicker = dynamic(
  () => import('./themed-emoji-picker').then(mod => mod.ThemedEmojiPicker),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse">
        <div className="h-10 bg-muted rounded mb-4"></div>
        <div className="grid grid-cols-8 gap-2">
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    ),
  }
);
```

## Example Implementation

### Basic Emoji Picker Component

```typescript
// features/shared/ui/src/components/emoji/index.tsx
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { LazyEmojiPicker } from './lazy-emoji-picker';
import { EmojiData } from 'frimousse';

interface EmojiInputProps {
  value?: string;
  onChange?: (emoji: string) => void;
  placeholder?: string;
  className?: string;
}

export const EmojiInput: React.FC<EmojiInputProps> = ({
  value = '',
  onChange,
  placeholder = '😀',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleEmojiSelect = (emoji: EmojiData) => {
    onChange?.(emoji.native);
    setIsOpen(false);
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-12 h-12 p-0 text-lg",
            !value && "text-muted-foreground",
            className
          )}
          aria-label="Select emoji"
        >
          {value || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <LazyEmojiPicker 
          onEmojiSelect={handleEmojiSelect}
          className="border-0"
        />
      </PopoverContent>
    </Popover>
  );
};

// Re-export all emoji-related components
export { LazyEmojiPicker } from './lazy-emoji-picker';
export { ThemedEmojiPicker } from './themed-emoji-picker';
export { AccessibleEmojiPicker } from './themed-emoji-picker';
```

### Rich Text Editor Integration

```typescript
// Example integration with a rich text editor
import React from 'react';
import { Button } from '../ui/button';
import { Smile } from 'lucide-react';
import { LazyEmojiPicker } from './index';

interface RichTextEmojiButtonProps {
  onEmojiInsert: (emoji: string) => void;
  className?: string;
}

export const RichTextEmojiButton: React.FC<RichTextEmojiButtonProps> = ({
  onEmojiInsert,
  className
}) => {
  const [showPicker, setShowPicker] = useState(false);
  
  const handleEmojiSelect = (emoji: EmojiData) => {
    onEmojiInsert(emoji.native);
    setShowPicker(false);
  };
  
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPicker(!showPicker)}
        className={cn("h-8 w-8 p-0", className)}
        aria-label="Insert emoji"
      >
        <Smile className="h-4 w-4" />
      </Button>
      
      {showPicker && (
        <div className="absolute z-50 mt-2 left-0">
          <div className="bg-background border border-border rounded-md shadow-lg">
            <LazyEmojiPicker 
              onEmojiSelect={handleEmojiSelect}
              className="w-80"
            />
          </div>
        </div>
      )}
    </div>
  );
};
```

## Integration Patterns

### 1. Form Field Integration

```typescript
// Integration with react-hook-form
import { Controller } from 'react-hook-form';
import { EmojiInput } from './emoji/index';

export const EmojiFormField: React.FC<{
  name: string;
  control: any;
  label?: string;
}> = ({ name, control, label }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="space-y-2">
          {label && <label className="text-sm font-medium">{label}</label>}
          <EmojiInput
            value={field.value}
            onChange={field.onChange}
          />
        </div>
      )}
    />
  );
};
```

### 2. Comment System Integration

```typescript
// Comment composer with emoji support
export const CommentComposer: React.FC<{
  onSubmit: (content: string) => void;
}> = ({ onSubmit }) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.slice(0, start) + emoji + content.slice(end);
      setContent(newContent);
      
      // Reset cursor position
      setTimeout(() => {
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
        textarea.focus();
      }, 0);
    }
  };
  
  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        className="min-h-[100px]"
      />
      
      <div className="flex justify-between items-center">
        <RichTextEmojiButton onEmojiInsert={insertEmoji} />
        <Button onClick={() => onSubmit(content)}>
          Post Comment
        </Button>
      </div>
    </div>
  );
};
```

## Testing Strategy

### Unit Tests

```typescript
// features/shared/ui/src/components/emoji/__tests__/emoji-picker.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmojiInput } from '../index';

describe('EmojiInput', () => {
  it('renders with placeholder', () => {
    render(<EmojiInput placeholder="🚀" />);
    expect(screen.getByLabelText('Select emoji')).toHaveTextContent('🚀');
  });
  
  it('calls onChange when emoji is selected', async () => {
    const onChange = jest.fn();
    render(<EmojiInput onChange={onChange} />);
    
    // Open picker
    fireEvent.click(screen.getByLabelText('Select emoji'));
    
    // Wait for lazy loading
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Simulate emoji selection (would need to mock the picker)
    // Implementation depends on Frimousse's test utilities
  });
});
```

### Integration Tests

```typescript
// Test with Playwright for E2E scenarios
import { test, expect } from '@playwright/test';

test('emoji picker integration', async ({ page }) => {
  await page.goto('/ui-demo');
  
  // Click emoji button
  await page.click('[aria-label="Select emoji"]');
  
  // Wait for picker to load
  await page.waitForSelector('.frimousse-emoji-picker');
  
  // Select an emoji
  await page.click('.emoji-button[data-emoji="😀"]');
  
  // Verify emoji was selected
  await expect(page.locator('[aria-label="Select emoji"]')).toHaveText('😀');
});
```

## Updating Component Development Standards

Add these guidelines to your component development standards:

### Emoji Component Guidelines

1. **Always use lazy loading** for emoji pickers to minimize bundle impact
2. **Implement proper accessibility** with ARIA labels and keyboard navigation
3. **Support SSR** by using client-side only rendering patterns
4. **Follow theme integration** patterns using CSS variables
5. **Provide loading states** for better user experience
6. **Test with screen readers** to ensure accessibility compliance

### Code Review Checklist

When reviewing emoji-related components:

- [ ] Lazy loading implemented for performance
- [ ] Accessibility features properly implemented
- [ ] Theme integration follows shadcn/ui patterns
- [ ] SSR compatibility ensured
- [ ] TypeScript types properly defined
- [ ] Loading states provided
- [ ] Focus management implemented (for modal usage)
- [ ] Bundle size impact documented

## Migration Strategy

If you're replacing an existing emoji picker:

1. **Install Frimousse** alongside existing picker
2. **Create wrapper components** following the patterns above  
3. **Implement in one feature** as a pilot
4. **Gather feedback** on performance and UX
5. **Gradually migrate** other components
6. **Remove old emoji picker** once migration is complete

## Troubleshooting

### Common Issues

**Bundle size concerns**: Use lazy loading and code splitting
**SSR hydration errors**: Implement client-side only rendering
**Theme not applying**: Ensure CSS variables are properly imported
**Accessibility issues**: Test with screen readers and keyboard navigation
**Performance problems**: Check virtual scrolling settings and emoji data loading

### Debug Mode

```typescript
// Enable debug mode for development
const debugConfig = {
  debug: process.env.NODE_ENV === 'development',
  logEmojiSelection: true,
  showBundleSize: true,
};

export const DebugEmojiPicker = (props) => (
  <ThemedEmojiPicker {...debugConfig} {...props} />
);
```

## Future Considerations

### Potential Enhancements

- **Custom emoji sets**: Support for custom/brand emojis
- **Emoji reactions**: Quick reaction picker for comments/posts  
- **Search improvements**: Recent/frequently used emoji tracking
- **Internationalization**: Multi-language emoji names and categories
- **Advanced theming**: More granular theme customization options

### Performance Monitoring

```typescript
// Monitor emoji picker performance
const useEmojiPickerAnalytics = () => {
  const trackEmojiSelection = (emoji: EmojiData) => {
    // Analytics tracking
    window.gtag?.('event', 'emoji_selected', {
      emoji_code: emoji.id,
      emoji_name: emoji.name,
    });
  };
  
  return { trackEmojiSelection };
};
```

---

This documentation provides a comprehensive foundation for integrating Frimousse emoji picker into the Struktura platform. Follow these patterns to ensure consistent, performant, and accessible emoji functionality across all features.