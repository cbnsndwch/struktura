import type { MetaFunction } from 'react-router';

import * as React from 'react';

// Import components from the shared UI workspace - using multiple import patterns to test integration
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Badge,
    Input,
    Label,
    ThemeToggle,
    SimpleThemeToggle,
    useTheme,
    // Data table components
    DataTable,
    DataTableColumnHeader,
    DataTablePagination,
    DataTableToolbar,
    DataTableViewOptions,
    DataTableFacetedFilter,
    Checkbox
} from '@cbnsndwch/struktura-shared-ui';
import { cn } from '@cbnsndwch/struktura-shared-ui/lib/utils.js';

// Import React Table functionality  
import {
    createColumnHelper,
    flexRender,
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

export const meta: MetaFunction = () => {
    return [
        { title: 'UI Demo • Struktura' },
        {
            name: 'description',
            content: 'Demonstration of shared UI component integration'
        }
    ];
};

// Sample data for the data table demo
type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive' | 'pending';
    lastLogin: string;
    projects: number;
};

const sampleUsers: User[] = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin',
        status: 'active',
        lastLogin: '2024-01-15',
        projects: 12
    },
    {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'Editor',
        status: 'active',
        lastLogin: '2024-01-14',
        projects: 8
    },
    {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'Viewer',
        status: 'inactive',
        lastLogin: '2024-01-10',
        projects: 3
    },
    {
        id: '4',
        name: 'Alice Brown',
        email: 'alice@example.com',
        role: 'Editor',
        status: 'pending',
        lastLogin: '2024-01-12',
        projects: 5
    },
    {
        id: '5',
        name: 'Charlie Wilson',
        email: 'charlie@example.com',
        role: 'Admin',
        status: 'active',
        lastLogin: '2024-01-16',
        projects: 15
    }
];

const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' }
];

const roleOptions = [
    { label: 'Admin', value: 'Admin' },
    { label: 'Editor', value: 'Editor' },
    { label: 'Viewer', value: 'Viewer' }
];

export default function UIDemo() {
    const { theme, resolvedTheme } = useTheme();

    // Data table state
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    // Table column definitions
    const columns: ColumnDef<User>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Name" />
            ),
            cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>
        },
        {
            accessorKey: 'email',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Email" />
            ),
            cell: ({ row }) => <div>{row.getValue('email')}</div>
        },
        {
            accessorKey: 'role',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Role" />
            ),
            cell: ({ row }) => {
                const role = row.getValue('role') as string;
                return (
                    <Badge variant="outline">{role}</Badge>
                );
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            }
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                return (
                    <Badge variant={status === 'active' ? 'default' : status === 'pending' ? 'secondary' : 'destructive'}>
                        {status}
                    </Badge>
                );
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            }
        },
        {
            accessorKey: 'projects',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Projects" />
            ),
            cell: ({ row }) => {
                const projects = row.getValue('projects') as number;
                return <div className="text-right font-mono">{projects}</div>;
            }
        },
        {
            accessorKey: 'lastLogin',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Last Login" />
            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue('lastLogin'));
                return <div>{date.toLocaleDateString()}</div>;
            }
        }
    ];

    const table = useReactTable({
        data: sampleUsers,
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
            rowSelection
        }
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <Badge variant="secondary">
                            🎨 UI Integration Demo (Hot Reload Test!)
                        </Badge>
                        <div className="flex gap-2">
                            <SimpleThemeToggle />
                            <ThemeToggle />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">
                        Shared UI Component Integration
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        This page demonstrates that the main app successfully
                        integrates with the shared UI component workspace.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Theme System Test</CardTitle>
                            <CardDescription>
                                Dark/light mode switching with smooth
                                transitions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Current theme settings:</Label>
                                <div className="p-3 bg-muted rounded">
                                    <p className="text-sm">
                                        Theme preference:{' '}
                                        <Badge variant="outline">{theme}</Badge>
                                    </p>
                                    <p className="text-sm">
                                        Resolved theme:{' '}
                                        <Badge variant="outline">
                                            {resolvedTheme}
                                        </Badge>
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm font-medium">
                                    Test theme switching:
                                </p>
                                <div className="flex gap-2">
                                    <SimpleThemeToggle />
                                    <ThemeToggle />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Component Integration Test</CardTitle>
                            <CardDescription>
                                Various shadcn/ui components working together
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="test-input">Sample Input</Label>
                                <Input
                                    id="test-input"
                                    placeholder="Type something here..."
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button>Primary Button</Button>
                                <Button variant="outline">Secondary</Button>
                                <Button variant="ghost">Ghost</Button>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                <Badge>Default</Badge>
                                <Badge variant="secondary">Secondary</Badge>
                                <Badge variant="destructive">Destructive</Badge>
                                <Badge variant="outline">Outline</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>CN Utility Function</CardTitle>
                            <CardDescription>
                                Testing the cn utility from shared workspace
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div
                                className={cn(
                                    'p-4 rounded border-2 transition-colors',
                                    'bg-primary/10 border-primary/20 hover:bg-primary/20',
                                    'text-primary'
                                )}
                            >
                                This div uses the `cn()` utility function from
                                the shared workspace to merge Tailwind classes
                                properly. The fact that you can see these styles
                                means the lib/utils import is working!
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Integration Status</CardTitle>
                            <CardDescription>
                                Verification of all integration requirements
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                    >
                                        ✅ Workspace dependency
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        @cbnsndwch/struktura-shared-ui workspace
                                        dependency configured
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                    >
                                        ✅ CSS imports
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Global styles imported in app.css
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                    >
                                        ✅ Component imports
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Components successfully imported and
                                        rendering
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                    >
                                        ✅ Utility functions
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        lib/utils.js (cn function) working
                                        properly
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                    >
                                        ✅ Build system
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Vite correctly resolves workspace
                                        dependencies
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                    >
                                        ✅ TypeScript
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Type imports resolve correctly
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                    >
                                        ✅ Theme system
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Dark/light mode with smooth transitions
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Data Table Demo Section */}
                <div className="mt-12">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">📊 Data Table Components</h2>
                        <p className="text-muted-foreground">
                            Advanced data table with sorting, filtering, pagination, and row selection - 
                            vendored from tablecn with NUQS dependency removed.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>User Management Table</CardTitle>
                            <CardDescription>
                                Comprehensive data table example with all features enabled
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <DataTable 
                                table={table}
                                actionBar={<DataTablePagination table={table} />}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-1 items-center space-x-2">
                                        <Input
                                            placeholder="Filter names..."
                                            value={
                                                (table.getColumn('name')?.getFilterValue() as string) ?? ''
                                            }
                                            onChange={(event) =>
                                                table.getColumn('name')?.setFilterValue(event.target.value)
                                            }
                                            className="h-8 w-[150px] lg:w-[250px]"
                                        />
                                        {table.getColumn('status') && (
                                            <DataTableFacetedFilter
                                                column={table.getColumn('status')}
                                                title="Status"
                                                options={statusOptions}
                                            />
                                        )}
                                        {table.getColumn('role') && (
                                            <DataTableFacetedFilter
                                                column={table.getColumn('role')}
                                                title="Role"
                                                options={roleOptions}
                                            />
                                        )}
                                        {(table.getState().columnFilters.length > 0) && (
                                            <Button
                                                variant="ghost"
                                                onClick={() => table.resetColumnFilters()}
                                                className="h-8 px-2 lg:px-3"
                                            >
                                                Reset
                                                <span className="ml-2">✕</span>
                                            </Button>
                                        )}
                                    </div>
                                    <DataTableViewOptions table={table} />
                                </div>
                            </DataTable>
                        </CardContent>
                    </Card>

                    {/* Additional Demo Cards */}
                    <div className="grid gap-6 md:grid-cols-2 mt-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>✨ Features Demonstrated</CardTitle>
                                <CardDescription>
                                    All vendored tablecn functionality working
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                                        ✅ Column Sorting
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Click column headers to sort
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                                        ✅ Text Filtering
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Search by name
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                                        ✅ Faceted Filters
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Multi-select status & role filters
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                                        ✅ Row Selection
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Individual & bulk selection
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                                        ✅ Pagination
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Configurable page sizes
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                                        ✅ Column Visibility
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Show/hide columns via dropdown
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>🔧 Technical Implementation</CardTitle>
                                <CardDescription>
                                    Integration details and dependencies
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                                        📦 @tanstack/react-table
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Core table functionality
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800">
                                        🎨 shadcn/ui integration
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Consistent theme system
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
                                        ❌ NUQS removed
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Internal state management
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                                        ✅ Fully vendored
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        No external DiceUI dependencies
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800">
                                        🔤 TypeScript strict
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Full type safety maintained
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800">
                                        📱 Responsive design
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Mobile & desktop friendly
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                        <strong>Integration Complete!</strong> The main app can
                        now:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li>
                            • Import components from the shared UI workspace
                        </li>
                        <li>
                            • Use utility functions like cn() for class merging
                        </li>
                        <li>• Build successfully with all dependencies</li>
                        <li>• Maintain proper TypeScript type checking</li>
                        <li>• Support hot reload during development</li>
                        <li>
                            • Switch between light and dark themes seamlessly
                        </li>
                        <li>
                            • Advanced data tables with sorting, filtering, and pagination
                        </li>
                        <li>
                            • Vendored tablecn components without NUQS dependency
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
