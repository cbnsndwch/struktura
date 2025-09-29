# Data Table Components

Advanced data table components based on vendored tablecn with shadcn/ui integration.

## Overview

These components provide a complete data table solution with sorting, filtering, pagination, and row selection capabilities. Built on top of TanStack React Table with full TypeScript support.

## Components

### DataTable

The main table component that renders the table structure.

```tsx
import { DataTable } from '@cbnsndwch/struktura-shared-ui';

<DataTable table={table} actionBar={<DataTablePagination table={table} />} />
```

### DataTableColumnHeader

Sortable column header with dropdown actions.

```tsx
import { DataTableColumnHeader } from '@cbnsndwch/struktura-shared-ui';

{
  accessorKey: 'name',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Name" />
  ),
}
```

### DataTablePagination

Pagination controls with configurable page sizes.

```tsx
import { DataTablePagination } from '@cbnsndwch/struktura-shared-ui';

<DataTablePagination table={table} />
```

### DataTableViewOptions

Column visibility dropdown control.

```tsx
import { DataTableViewOptions } from '@cbnsndwch/struktura-shared-ui';

<DataTableViewOptions table={table} />
```

### DataTableFacetedFilter

Multi-select faceted filter with badges.

```tsx
import { DataTableFacetedFilter } from '@cbnsndwch/struktura-shared-ui';

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
];

<DataTableFacetedFilter
  column={table.getColumn('status')}
  title="Status"
  options={statusOptions}
/>
```

## Complete Example

```tsx
import * as React from 'react';
import {
  DataTable,
  DataTableColumnHeader,
  DataTablePagination,
  DataTableFacetedFilter,
  DataTableViewOptions,
  Checkbox,
  Badge,
  Button,
  Input
} from '@cbnsndwch/struktura-shared-ui';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState
} from '@tanstack/react-table';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

const data: User[] = [
  // ... your data
];

export function UserTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns: ColumnDef<User>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => <Badge variant="outline">{row.getValue('role')}</Badge>,
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge variant={row.getValue('status') === 'active' ? 'default' : 'secondary'}>
          {row.getValue('status')}
        </Badge>
      ),
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  const roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' }
  ];

  return (
    <DataTable 
      table={table}
      actionBar={<DataTablePagination table={table} />}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Filter names..."
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Status"
            options={statusOptions}
          />
          <DataTableFacetedFilter
            column={table.getColumn('role')}
            title="Role"
            options={roleOptions}
          />
          {table.getState().columnFilters.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2 lg:px-3"
            >
              Reset
            </Button>
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>
    </DataTable>
  );
}
```

## Features

- ✅ **Column Sorting** - Click column headers to sort data
- ✅ **Text Filtering** - Search and filter by text fields
- ✅ **Faceted Filtering** - Multi-select filters with option counts
- ✅ **Row Selection** - Individual and bulk row selection
- ✅ **Pagination** - Configurable page sizes and navigation
- ✅ **Column Visibility** - Show/hide columns dynamically
- ✅ **Responsive Design** - Mobile and desktop friendly
- ✅ **Theme Integration** - Full shadcn/ui theme support
- ✅ **TypeScript Support** - Complete type safety

## Dependencies

- `@tanstack/react-table` - Core table functionality
- `shadcn/ui` components - UI primitives
- `lucide-react` - Icons

## Migration from NUQS

This implementation replaces NUQS with React state management:

- **Before**: URL state management with NUQS
- **After**: React hooks (`useState`) for local state
- **Benefit**: Reduced bundle size, simpler state management
- **Note**: URL persistence can be added later if needed using React Router 7 navigation

## Testing

Components include comprehensive unit tests:

```bash
pnpm test
```

Tests cover:
- Component rendering
- Data display
- Filtering functionality
- Utility functions
- Type safety