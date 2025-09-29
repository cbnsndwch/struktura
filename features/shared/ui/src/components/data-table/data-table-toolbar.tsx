import type { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';

import { Button } from '../ui/button.js';
import { Input } from '../ui/input.js';
import { DataTableViewOptions } from './data-table-view-options.js';

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    placeholder?: string;
    searchColumn?: string;
}

export function DataTableToolbar<TData>({
    table,
    placeholder = 'Filter...',
    searchColumn
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;

    // Get the first searchable column if no searchColumn is specified
    const defaultSearchColumn = searchColumn || table.getAllColumns()[0]?.id;

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                {defaultSearchColumn && (
                    <Input
                        placeholder={placeholder}
                        value={
                            (table
                                .getColumn(defaultSearchColumn)
                                ?.getFilterValue() as string) ?? ''
                        }
                        onChange={(event) =>
                            table
                                .getColumn(defaultSearchColumn)
                                ?.setFilterValue(event.target.value)
                        }
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                )}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
            <DataTableViewOptions table={table} />
        </div>
    );
}