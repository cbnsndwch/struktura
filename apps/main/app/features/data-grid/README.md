# Data Grid Feature

A spreadsheet-like grid interface for viewing and editing collection records in Struktura.

## Components

### DataGrid

The main grid component that displays collection records with sorting, editing, and bulk operations.

**Props:**

- `collectionId: string` - ID of the collection to display
- `fields: FieldDefinition[]` - Field definitions from the collection schema
- `records: CollectionRecord[]` - Array of records to display
- `isLoading?: boolean` - Loading state indicator
- `onUpdateRecord?: (recordId: string, data: Record<string, unknown>) => Promise<void>` - Callback for record updates
- `onDeleteRecords?: (recordIds: string[]) => Promise<void>` - Callback for bulk delete
- `onBulkUpdate?: (updates: Array<{ id: string; data: Record<string, unknown> }>) => Promise<void>` - Callback for bulk updates

**Features:**

- Column sorting (click header to toggle asc/desc)
- Row selection with checkboxes
- Inline editing with double-click
- Bulk delete operations
- Column resizing
- Responsive design with horizontal scroll

### CellEditor

Field type-specific editors for inline editing.

**Supported Field Types:**

- `TEXT`, `EMAIL`, `URL`, `PHONE` - Text inputs with appropriate HTML5 types
- `NUMBER`, `CURRENCY`, `PERCENT` - Number inputs with formatting
- `DATE`, `DATETIME` - Date/datetime pickers
- `BOOLEAN` - Checkbox
- `SELECT` - Dropdown with predefined options

**Keyboard Shortcuts:**

- `Enter` - Commit changes
- `Escape` - Cancel editing
- `Tab` - Commit and move to next cell (planned)

## Usage

```tsx
import { DataGrid } from '../features/data-grid';
import { recordsApi } from '../lib/api';

function CollectionView({ collection, records }) {
    const [localRecords, setLocalRecords] = useState(records);

    const handleUpdateRecord = async (recordId, data) => {
        const updated = await recordsApi.updateRecord(collection.id, recordId, {
            data
        });
        setLocalRecords(prev =>
            prev.map(r => (r.id === recordId ? updated : r))
        );
    };

    const handleDeleteRecords = async recordIds => {
        await recordsApi.bulkDeleteRecords(collection.id, recordIds);
        setLocalRecords(prev => prev.filter(r => !recordIds.includes(r.id)));
    };

    return (
        <DataGrid
            collectionId={collection.id}
            fields={collection.fields}
            records={localRecords}
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecords={handleDeleteRecords}
        />
    );
}
```

## Architecture

The grid is built using:

- **TanStack Table v8** - Headless table library providing sorting, filtering, and column management
- **shadcn/ui** - UI components for consistent styling
- **React Router 7** - For routing and data loading

## Future Enhancements

- Arrow key navigation between cells
- Column-level filtering
- URL parameter persistence for sort/filter state
- Frozen columns for wide datasets
- Undo/redo functionality
- Export to CSV/Excel
- Cell validation with error messages
- Keyboard shortcuts for bulk operations
