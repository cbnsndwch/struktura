/**
 * DataGrid component - spreadsheet-like grid for collection records
 */
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
    type RowSelectionState,
    type ColumnFiltersState,
    type ColumnResizeMode
} from '@tanstack/react-table';
import type { CollectionRecord } from '@cbnsndwch/struktura-schema-contracts';
import type { FieldDefinition } from '@cbnsndwch/struktura-collections-contracts';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Checkbox,
    Button,
    Skeleton,
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@cbnsndwch/struktura-shared-ui';
import { Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

import { CellEditor } from './CellEditor.js';

export interface DataGridProps {
    collectionId: string;
    fields: FieldDefinition[];
    records: CollectionRecord[];
    isLoading?: boolean;
    onUpdateRecord?: (
        recordId: string,
        data: Record<string, unknown>
    ) => Promise<void>;
    onDeleteRecords?: (recordIds: string[]) => Promise<void>;
    onBulkUpdate?: (
        updates: Array<{ id: string; data: Record<string, unknown> }>
    ) => Promise<void>;
}

export function DataGrid({
    // collectionId,
    fields,
    records,
    isLoading = false,
    onUpdateRecord,
    onDeleteRecords
}: DataGridProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [columnResizeMode] = useState<ColumnResizeMode>('onChange');
    const [editingCell, setEditingCell] = useState<{
        rowId: string;
        columnId: string;
    } | null>(null);
    const [editValue, setEditValue] = useState<unknown>('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedIdsToDelete, setSelectedIdsToDelete] = useState<string[]>([]);
    const [focusedCell, setFocusedCell] = useState<{
        rowIndex: number;
        columnIndex: number;
    } | null>(null);

    // Cell interaction handlers (defined before columns to avoid circular dependency)
    const handleCellClick = useCallback(
        (rowId: string, columnId: string, value: unknown) => {
            // Single click - select/focus (handled in cell render)
        },
        []
    );

    const handleCellDoubleClick = useCallback(
        (rowId: string, columnId: string, value: unknown) => {
            // Double click - start editing
            if (columnId !== 'select') {
                setEditingCell({ rowId, columnId });
                setEditValue(value ?? '');
            }
        },
        []
    );

    const handleCellBlur = useCallback(
        async (recordId: string, fieldName: string) => {
            if (editingCell && onUpdateRecord) {
                const currentValue = records.find(r => r.id === recordId)?.data[
                    fieldName
                ];

                if (editValue !== currentValue) {
                    try {
                        await onUpdateRecord(recordId, {
                            [fieldName]: editValue
                        });
                    } catch (error) {
                        console.error('Failed to update cell:', error);
                    }
                }
            }

            setEditingCell(null);
            setEditValue('');
        },
        [editingCell, editValue, records, onUpdateRecord]
    );

    const handleCellCancel = useCallback(() => {
        setEditingCell(null);
        setEditValue('');
    }, []);

    // Create column definitions from field definitions
    const columns = useMemo<ColumnDef<CollectionRecord>[]>(() => {
        const cols: ColumnDef<CollectionRecord>[] = [
            // Selection column
            {
                id: 'select',
                size: 40,
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={value =>
                            table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={value => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                ),
                enableSorting: false,
                enableResizing: false
            }
        ];

        // Add field columns
        fields.forEach((field, fieldIndex) => {
            cols.push({
                accessorKey: `data.${field.name}`,
                id: field.name,
                header: field.name,
                size: 200,
                cell: ({ row, column, table }) => {
                    const value = row.original.data[field.name];
                    const rowIndex = table.getRowModel().rows.findIndex(r => r.id === row.id);
                    const isFocused = focusedCell?.rowIndex === rowIndex && focusedCell?.columnIndex === fieldIndex;
                    const isEditing =
                        editingCell?.rowId === row.id &&
                        editingCell?.columnId === column.id;

                    if (isEditing) {
                        return (
                            <CellEditor
                                field={field}
                                value={editValue}
                                onChange={setEditValue}
                                onCommit={() =>
                                    handleCellBlur(row.original.id, field.name)
                                }
                                onCancel={() => handleCellCancel()}
                            />
                        );
                    }

                    return (
                        <div
                            className={`px-2 py-1 cursor-pointer hover:bg-muted/50 ${
                                isFocused ? 'ring-2 ring-primary ring-inset bg-muted/30' : ''
                            }`}
                            onClick={() => {
                                setFocusedCell({ rowIndex, columnIndex: fieldIndex });
                                handleCellClick(row.id, column.id, value);
                            }}
                            onDoubleClick={() =>
                                handleCellDoubleClick(row.id, column.id, value)
                            }
                        >
                            {formatCellValue(value, field.type)}
                        </div>
                    );
                },
                enableSorting: true,
                enableResizing: true
            });
        });

        return cols;
    }, [fields, focusedCell, editingCell, editValue, handleCellClick, handleCellDoubleClick, handleCellBlur, handleCellCancel]);

    const table = useReactTable({
        data: records,
        columns,
        columnResizeMode,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        enableRowSelection: true,
        enableColumnResizing: true,
        state: {
            sorting,
            columnFilters,
            rowSelection
        },
        getRowId: row => row.id
    });

    const handleCellKeyDown = useCallback(
        (
            e: React.KeyboardEvent<HTMLInputElement>,
            recordId: string,
            fieldName: string
        ) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleCellBlur(recordId, fieldName);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                handleCellCancel();
            }
        },
        [handleCellBlur, handleCellCancel]
    );

    const handleDeleteSelected = useCallback(() => {
        const selectedIds = Object.keys(rowSelection);
        if (selectedIds.length > 0 && onDeleteRecords) {
            setSelectedIdsToDelete(selectedIds);
            setShowDeleteDialog(true);
        }
    }, [rowSelection, onDeleteRecords]);

    const confirmDelete = useCallback(async () => {
        if (selectedIdsToDelete.length > 0 && onDeleteRecords) {
            try {
                await onDeleteRecords(selectedIdsToDelete);
                setRowSelection({});
                setShowDeleteDialog(false);
                setSelectedIdsToDelete([]);
            } catch (error) {
                console.error('Failed to delete records:', error);
                toast.error('Failed to delete records. Please try again.');
            }
        }
    }, [selectedIdsToDelete, onDeleteRecords]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (editingCell) {
                // Don't handle navigation while editing
                return;
            }

            if (!focusedCell || records.length === 0) {
                return;
            }

            const { rowIndex, columnIndex } = focusedCell;
            const dataColumns = fields.length; // Number of data columns (excluding selection column)

            // Handle arrow key navigation
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    if (rowIndex > 0) {
                        setFocusedCell({
                            rowIndex: rowIndex - 1,
                            columnIndex
                        });
                    }
                    break;

                case 'ArrowDown':
                    e.preventDefault();
                    if (rowIndex < records.length - 1) {
                        setFocusedCell({
                            rowIndex: rowIndex + 1,
                            columnIndex
                        });
                    }
                    break;

                case 'ArrowLeft':
                    e.preventDefault();
                    if (columnIndex > 0) {
                        setFocusedCell({
                            rowIndex,
                            columnIndex: columnIndex - 1
                        });
                    }
                    break;

                case 'ArrowRight':
                    e.preventDefault();
                    if (columnIndex < dataColumns - 1) {
                        setFocusedCell({
                            rowIndex,
                            columnIndex: columnIndex + 1
                        });
                    }
                    break;

                case 'Enter':
                    e.preventDefault();
                    // Enter edit mode for the focused cell
                    const row = table.getRowModel().rows[rowIndex];
                    const field = fields[columnIndex];
                    if (row && field) {
                        const currentValue = row.original.data[field.name];
                        setEditingCell({
                            rowId: row.id,
                            columnId: field.name
                        });
                        setEditValue(currentValue);
                    }
                    break;

                case 'Tab':
                    e.preventDefault();
                    // Tab moves to next cell (with wrapping)
                    let nextColumnIndex = columnIndex + 1;
                    let nextRowIndex = rowIndex;

                    if (nextColumnIndex >= dataColumns) {
                        nextColumnIndex = 0;
                        nextRowIndex = rowIndex + 1;
                    }

                    if (nextRowIndex < records.length) {
                        setFocusedCell({
                            rowIndex: nextRowIndex,
                            columnIndex: nextColumnIndex
                        });
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [editingCell, focusedCell, records.length, fields, table]);

    const selectedCount = Object.keys(rowSelection).length;

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (records.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
                <p className="text-muted-foreground mb-4">No records yet</p>
                <Button>Add first record</Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            {selectedCount > 0 && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <span className="text-sm font-medium">
                        {selectedCount} row(s) selected
                    </span>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteSelected}
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                    </Button>
                </div>
            )}

            {/* Grid */}
            <div className="rounded-md border overflow-auto max-h-150">
                <Table style={{ width: table.getTotalSize() }}>
                    <TableHeader className="sticky top-0 bg-background z-10">
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead
                                        key={header.id}
                                        style={{ width: header.getSize() }}
                                        className="relative"
                                    >
                                        <div
                                            className={
                                                header.column.getCanSort()
                                                    ? 'cursor-pointer select-none'
                                                    : ''
                                            }
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {{
                                                asc: ' ↑',
                                                desc: ' ↓'
                                            }[
                                                header.column.getIsSorted() as string
                                            ] ?? null}
                                        </div>
                                        {header.column.getCanResize() && (
                                            <div
                                                onMouseDown={header.getResizeHandler()}
                                                onTouchStart={header.getResizeHandler()}
                                                className="absolute right-0 top-0 h-full w-1 bg-border hover:bg-primary cursor-col-resize"
                                            />
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map(row => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && 'selected'}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <TableCell
                                        key={cell.id}
                                        style={{ width: cell.column.getSize() }}
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedIdsToDelete.length} record(s)? 
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setShowDeleteDialog(false);
                            setSelectedIdsToDelete([]);
                        }}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// Helper function to format cell values based on field type
function formatCellValue(value: unknown, fieldType: string): string {
    if (value === null || value === undefined) {
        return '';
    }

    switch (fieldType) {
        case 'date':
            try {
                const date = new Date(value as string);
                if (isNaN(date.getTime())) {
                    return '';
                }
                return date.toLocaleDateString();
            } catch {
                return '';
            }
        case 'datetime':
            try {
                const date = new Date(value as string);
                if (isNaN(date.getTime())) {
                    return '';
                }
                return date.toLocaleString();
            } catch {
                return '';
            }
        case 'boolean':
            return value ? '✓' : '✗';
        case 'number':
            return typeof value === 'number'
                ? value.toLocaleString()
                : String(value);
        case 'currency':
            return typeof value === 'number'
                ? new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                  }).format(value)
                : String(value);
        case 'percent':
            return typeof value === 'number'
                ? `${(value * 100).toFixed(2)}%`
                : String(value);
        case 'email':
        case 'url':
        case 'phone':
            return String(value);
        default:
            return String(value);
    }
}
