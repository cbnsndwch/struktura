# Workspace Navigation Components

This directory contains the navigation components for the Struktura workspace interface.

## Components

### WorkspaceNavigation

The main sidebar navigation component that displays collections, favorites, and recent items.

**Features:**

- Collapsible sidebar with icon mode
- Collections list with inline search
- Favorites section (starred collections)
- Recent collections tracking
- Quick actions (Search, Dashboard)
- Collection context menus
- Mobile-responsive with sheet drawer

**Usage:**

```tsx
import { WorkspaceNavigation } from './workspace-navigation';

<WorkspaceNavigation
    workspaceId="workspace-123"
    workspaceName="My Workspace"
    collections={collections}
    recentCollections={recentCollections}
    favoriteCollections={favoriteCollections}
    currentCollectionId="collection-456"
    onSearch={() => setSearchOpen(true)}
    onToggleFavorite={toggleFavorite}
    isFavorite={isFavorite}
/>;
```

### CollectionSearch

Command palette-style quick search for collections.

**Features:**

- Keyboard shortcut: Cmd/Ctrl+K
- Search across all collections
- Grouped results (Favorites, Recent, All)
- Collection descriptions and record counts
- Keyboard navigation

**Usage:**

```tsx
import { CollectionSearch } from './collection-search';

<CollectionSearch
    open={searchOpen}
    onOpenChange={setSearchOpen}
    workspaceId="workspace-123"
    collections={collections}
    recentCollections={recentCollections}
    favoriteCollections={favoriteCollections}
/>;
```

### ViewSwitcher

Toggle between different collection view types.

**Features:**

- Grid, List, Kanban, Calendar views
- Icon-based interface
- Tooltips with descriptions
- Configurable available views

**Usage:**

```tsx
import { ViewSwitcher } from './view-switcher';

<ViewSwitcher
    currentView={currentView}
    onViewChange={setCurrentView}
    availableViews={['grid', 'list', 'kanban', 'calendar']}
/>;
```

### WorkspaceBreadcrumbs

Hierarchical breadcrumb navigation.

**Features:**

- Shows current location
- Clickable navigation links
- Home icon for workspace root
- Customizable segments

**Usage:**

```tsx
import { WorkspaceBreadcrumbs } from './workspace-breadcrumbs';

<WorkspaceBreadcrumbs
    workspaceId="workspace-123"
    workspaceName="My Workspace"
    segments={[
        {
            label: 'Products',
            href: '/workspaces/workspace-123/collections/products'
        },
        { label: 'Grid View' }
    ]}
/>;
```

### WorkspaceLayout

Main layout wrapper that combines navigation, breadcrumbs, and content area.

**Features:**

- Integrated sidebar navigation
- Header with breadcrumbs
- Content area with Outlet
- Keyboard shortcut handling
- Auto-tracking of recent collections

**Usage:**

```tsx
import { WorkspaceLayout } from './workspace-layout';

<WorkspaceLayout
    workspaceId="workspace-123"
    workspaceName="My Workspace"
    collections={collections}
    currentCollectionId="collection-456"
    breadcrumbSegments={[
        {
            label: 'Products',
            href: '/workspaces/workspace-123/collections/products'
        }
    ]}
>
    {/* Your content here */}
</WorkspaceLayout>;
```

## Hooks

### useKeyboardShortcuts

Manage keyboard shortcuts for navigation.

**Usage:**

```tsx
import { useKeyboardShortcuts } from '../hooks/use-keyboard-shortcuts';

useKeyboardShortcuts([
    {
        key: 'k',
        ctrlOrCmd: true,
        handler: () => setSearchOpen(true),
        description: 'Open quick search'
    },
    {
        key: 's',
        ctrlOrCmd: true,
        handler: () => saveChanges(),
        description: 'Save changes'
    }
]);
```

### useFavoriteCollections

Manage favorite/starred collections with localStorage persistence.

**Usage:**

```tsx
import { useFavoriteCollections } from '../hooks/use-favorite-collections';

const { favoriteCollections, isFavorite, toggleFavorite, clearFavorites } =
    useFavoriteCollections(workspaceId);

// Check if collection is favorited
const starred = isFavorite('collection-123');

// Toggle favorite status
toggleFavorite({
    id: 'collection-123',
    name: 'Products',
    slug: 'products',
    workspaceId: 'workspace-456'
});
```

### useRecentCollections

Track recently accessed collections with localStorage persistence.

**Usage:**

```tsx
import { useRecentCollections } from '../hooks/use-recent-collections';

const { recentCollections, addRecentCollection, clearRecentCollections } =
    useRecentCollections(workspaceId);

// Add a collection to recent list
addRecentCollection({
    id: 'collection-123',
    name: 'Products',
    slug: 'products',
    workspaceId: 'workspace-456'
});
```

## Keyboard Shortcuts

- **Cmd/Ctrl+K**: Open quick search
- **Cmd/Ctrl+B**: Toggle sidebar (built into sidebar component)
- **Escape**: Close search dialog

## Mobile Support

All navigation components are fully responsive:

- Sidebar collapses to icon mode on mobile
- Sheet drawer for mobile navigation
- Touch-friendly interactive elements
- Optimized layouts for small screens

## Accessibility

- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast support
- Focus indicators

## Data Persistence

- **Favorites**: Stored in `localStorage` with key `struktura_favorite_collections`
- **Recents**: Stored in `localStorage` with key `struktura_recent_collections`
- **Sidebar State**: Stored in cookies with key `sidebar_state`

Data is scoped per workspace to avoid conflicts.
