import { describe, it, expect } from 'vitest';
import { getFilterOperators, formatFilterValue, generateId } from './utils.js';
import type { ExtendedColumnFilter } from '../../types/data-table.js';

describe('data-table utils', () => {
    describe('getFilterOperators', () => {
        it('should return text operators for text variant', () => {
            const operators = getFilterOperators('text');
            expect(operators).toContainEqual({ label: 'Contains', value: 'iLike' });
            expect(operators).toContainEqual({ label: 'Is empty', value: 'isEmpty' });
        });

        it('should return numeric operators for number variant', () => {
            const operators = getFilterOperators('number');
            expect(operators).toContainEqual({ label: 'Is', value: 'eq' });
            expect(operators).toContainEqual({ label: 'Is greater than', value: 'gt' });
        });

        it('should return boolean operators for boolean variant', () => {
            const operators = getFilterOperators('boolean');
            expect(operators).toContainEqual({ label: 'Is', value: 'eq' });
            expect(operators).toContainEqual({ label: 'Is not', value: 'ne' });
        });
    });

    describe('formatFilterValue', () => {
        it('should return empty string for isEmpty operator', () => {
            const filter: ExtendedColumnFilter<any> = {
                id: 'test',
                value: 'any',
                operator: 'isEmpty'
            };
            expect(formatFilterValue(filter)).toBe('');
        });

        it('should return empty string for isNotEmpty operator', () => {
            const filter: ExtendedColumnFilter<any> = {
                id: 'test',
                value: 'any',
                operator: 'isNotEmpty'
            };
            expect(formatFilterValue(filter)).toBe('');
        });

        it('should join array values with " - " for isBetween operator', () => {
            const filter: ExtendedColumnFilter<any> = {
                id: 'test',
                value: [10, 20],
                operator: 'isBetween'
            };
            expect(formatFilterValue(filter)).toBe('10 - 20');
        });

        it('should join array values with ", " for other operators', () => {
            const filter: ExtendedColumnFilter<any> = {
                id: 'test',
                value: ['apple', 'banana', 'cherry'],
                operator: 'inArray'
            };
            expect(formatFilterValue(filter)).toBe('apple, banana, cherry');
        });

        it('should convert single values to string', () => {
            const filter: ExtendedColumnFilter<any> = {
                id: 'test',
                value: 42,
                operator: 'eq'
            };
            expect(formatFilterValue(filter)).toBe('42');
        });
    });

    describe('generateId', () => {
        it('should generate a string id', () => {
            const id = generateId();
            expect(typeof id).toBe('string');
            expect(id.length).toBeGreaterThan(0);
        });

        it('should generate unique ids', () => {
            const id1 = generateId();
            const id2 = generateId();
            expect(id1).not.toBe(id2);
        });
    });
});