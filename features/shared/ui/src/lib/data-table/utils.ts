import type { Column } from '@tanstack/react-table';

import type {
    ExtendedColumnFilter,
    FilterOperator,
    FilterVariant
} from '../../types/data-table.js';

import { dataTableConfig } from './config.js';

export function getCommonPinningStyles<TData>({
    column,
    withBorder = false
}: {
    column: Column<TData>;
    withBorder?: boolean;
}): React.CSSProperties {
    const isPinned = column.getIsPinned();
    const isLastLeftPinnedColumn =
        isPinned === 'left' && column.getIsLastColumn('left');
    const isFirstRightPinnedColumn =
        isPinned === 'right' && column.getIsFirstColumn('right');

    return {
        boxShadow: withBorder
            ? isLastLeftPinnedColumn
                ? '-4px 0 4px -4px var(--border) inset'
                : isFirstRightPinnedColumn
                  ? '4px 0 4px -4px var(--border) inset'
                  : undefined
            : undefined,
        left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
        right:
            isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
        opacity: isPinned ? 0.97 : 1,
        position: isPinned ? 'sticky' : 'relative',
        background: isPinned ? 'hsl(var(--background))' : 'hsl(var(--background))',
        width: column.getSize(),
        zIndex: isPinned ? 1 : 0
    };
}

export function getFilterOperators(filterVariant: FilterVariant) {
    const operatorMap: Record<
        FilterVariant,
        { label: string; value: FilterOperator }[]
    > = {
        text: dataTableConfig.textOperators,
        number: dataTableConfig.numericOperators,
        range: dataTableConfig.numericOperators,
        date: dataTableConfig.dateOperators,
        dateRange: dataTableConfig.dateOperators,
        boolean: dataTableConfig.booleanOperators,
        select: dataTableConfig.selectOperators,
        multiSelect: dataTableConfig.multiSelectOperators
    };

    return operatorMap[filterVariant] ?? [];
}

export function formatFilterValue<TData>(
    filter: ExtendedColumnFilter<TData>
): string {
    const { value, operator } = filter;

    if (operator === 'isEmpty' || operator === 'isNotEmpty') {
        return '';
    }

    if (operator === 'isBetween' && Array.isArray(value)) {
        return value.join(' - ');
    }

    if (Array.isArray(value)) {
        return value.join(', ');
    }

    return String(value);
}

export function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}