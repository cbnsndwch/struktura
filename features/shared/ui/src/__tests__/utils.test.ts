import { describe, it, expect } from 'vitest';

import { cn } from '../lib/utils.js';

describe('Utils', () => {
    it('should merge class names correctly', () => {
        const result = cn('btn', 'btn-primary', 'text-white');
        expect(result).toBe('btn btn-primary text-white');
    });

    it('should handle conditional classes', () => {
        const isActive = true;
        const result = cn('btn', isActive && 'btn-active', 'text-white');
        expect(result).toBe('btn btn-active text-white');
    });

    it('should handle Tailwind conflicts', () => {
        const result = cn('px-2 py-1', 'px-4');
        expect(result).toBe('py-1 px-4');
    });
});
