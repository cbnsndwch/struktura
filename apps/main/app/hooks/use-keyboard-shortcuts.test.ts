/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useKeyboardShortcuts, getShortcutText } from './use-keyboard-shortcuts.js';

describe('useKeyboardShortcuts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call handler when keyboard shortcut is pressed', () => {
        const handler = vi.fn();
        const shortcuts = [
            {
                key: 'k',
                ctrlOrCmd: true,
                handler,
                description: 'Test shortcut'
            }
        ];

        renderHook(() => useKeyboardShortcuts(shortcuts));

        const event = new KeyboardEvent('keydown', {
            key: 'k',
            ctrlKey: true
        });
        window.dispatchEvent(event);

        expect(handler).toHaveBeenCalled();
    });

    it('should not call handler without modifier key', () => {
        const handler = vi.fn();
        const shortcuts = [
            {
                key: 'k',
                ctrlOrCmd: true,
                handler,
                description: 'Test shortcut'
            }
        ];

        renderHook(() => useKeyboardShortcuts(shortcuts));

        const event = new KeyboardEvent('keydown', {
            key: 'k',
            ctrlKey: false
        });
        window.dispatchEvent(event);

        expect(handler).not.toHaveBeenCalled();
    });

    it('should prevent default behavior when shortcut matches', () => {
        const handler = vi.fn();
        const shortcuts = [
            {
                key: 'k',
                ctrlOrCmd: true,
                handler,
                description: 'Test shortcut'
            }
        ];

        renderHook(() => useKeyboardShortcuts(shortcuts));

        const event = new KeyboardEvent('keydown', {
            key: 'k',
            ctrlKey: true
        });
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

        window.dispatchEvent(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should handle multiple shortcuts', () => {
        const handler1 = vi.fn();
        const handler2 = vi.fn();
        const shortcuts = [
            {
                key: 'k',
                ctrlOrCmd: true,
                handler: handler1,
                description: 'Shortcut 1'
            },
            {
                key: 's',
                ctrlOrCmd: true,
                handler: handler2,
                description: 'Shortcut 2'
            }
        ];

        renderHook(() => useKeyboardShortcuts(shortcuts));

        // Test first shortcut
        const event1 = new KeyboardEvent('keydown', {
            key: 'k',
            ctrlKey: true
        });
        window.dispatchEvent(event1);

        expect(handler1).toHaveBeenCalledTimes(1);
        expect(handler2).not.toHaveBeenCalled();

        // Test second shortcut
        const event2 = new KeyboardEvent('keydown', {
            key: 's',
            ctrlKey: true
        });
        window.dispatchEvent(event2);

        expect(handler1).toHaveBeenCalledTimes(1);
        expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should cleanup event listener on unmount', () => {
        const handler = vi.fn();
        const shortcuts = [
            {
                key: 'k',
                ctrlOrCmd: true,
                handler,
                description: 'Test shortcut'
            }
        ];

        const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts));

        unmount();

        const event = new KeyboardEvent('keydown', {
            key: 'k',
            ctrlKey: true
        });
        window.dispatchEvent(event);

        expect(handler).not.toHaveBeenCalled();
    });
});

describe('getShortcutText', () => {
    beforeEach(() => {
        // Reset navigator.platform
        Object.defineProperty(navigator, 'platform', {
            value: 'Win32',
            writable: true,
            configurable: true
        });
    });

    it('should format shortcut with Ctrl on Windows', () => {
        const shortcut = { key: 'k', ctrlOrCmd: true };
        const text = getShortcutText(shortcut);

        expect(text).toBe('Ctrl+K');
    });

    it('should format shortcut with Cmd on Mac', () => {
        Object.defineProperty(navigator, 'platform', {
            value: 'MacIntel',
            writable: true,
            configurable: true
        });

        const shortcut = { key: 'k', ctrlOrCmd: true };
        const text = getShortcutText(shortcut);

        expect(text).toBe('⌘+K');
    });

    it('should include shift modifier', () => {
        const shortcut = { key: 'k', ctrlOrCmd: true, shift: true };
        const text = getShortcutText(shortcut);

        expect(text).toContain('⇧');
        expect(text).toContain('K');
    });

    it('should include alt modifier', () => {
        const shortcut = { key: 'k', ctrlOrCmd: true, alt: true };
        const text = getShortcutText(shortcut);

        expect(text).toContain('Alt');
        expect(text).toContain('K');
    });
});
