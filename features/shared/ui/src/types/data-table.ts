import type { ColumnSort, Row, RowData } from '@tanstack/react-table';

import type { DataTableConfig } from '../lib/data-table/config.js';

declare module '@tanstack/react-table' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        label?: string;
        placeholder?: string;
        variant?: FilterVariant;
        options?: Option[];
        range?: [number, number];
        unit?: string;
        icon?: React.FC<React.SVGProps<SVGSVGElement>>;
    }
}

export interface Option {
    label: string;
    value: string;
    count?: number;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export type FilterOperator = DataTableConfig['operators'][number];
export type FilterVariant = DataTableConfig['filterVariants'][number];
export type JoinOperator = DataTableConfig['joinOperators'][number];

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, 'id'> {
    id: Extract<keyof TData, string>;
}

export interface ExtendedColumnFilter<TData> {
    id: Extract<keyof TData, string>;
    value: unknown;
    operator: FilterOperator;
    joinOperator?: JoinOperator;
}

export interface DataTableRowAction<TData> {
    row: Row<TData>;
    variant: 'update' | 'delete';
}

export interface SearchParams {
    [key: string]: string | string[] | undefined;
}

export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
