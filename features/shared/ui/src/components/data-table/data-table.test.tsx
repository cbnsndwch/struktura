import { render, screen } from '@testing-library/react';
import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable
} from '@tanstack/react-table';

import { describe, it, expect } from 'vitest';

import { DataTable } from './data-table.js';

interface TestData {
    id: string;
    name: string;
    email: string;
}

const testData: TestData[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
];

const columnHelper = createColumnHelper<TestData>();

const columns = [
    columnHelper.accessor('name', {
        header: 'Name',
        cell: info => info.getValue()
    }),
    columnHelper.accessor('email', {
        header: 'Email',
        cell: info => info.getValue()
    })
];

function TestDataTable() {
    const table = useReactTable({
        data: testData,
        columns,
        getCoreRowModel: getCoreRowModel()
    });

    return <DataTable table={table} />;
}

describe('DataTable', () => {
    it('should render table with data', () => {
        render(<TestDataTable />);

        // Check that headers are rendered
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();

        // Check that data is rendered
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('should show "No results" when data is empty', () => {
        function EmptyTestDataTable() {
            const emptyTable = useReactTable({
                data: [],
                columns,
                getCoreRowModel: getCoreRowModel()
            });

            return <DataTable table={emptyTable} />;
        }

        render(<EmptyTestDataTable />);

        expect(screen.getByText('No results.')).toBeInTheDocument();
    });
});
