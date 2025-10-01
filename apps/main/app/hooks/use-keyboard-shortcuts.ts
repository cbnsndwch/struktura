/**
 * Keyboard shortcuts hook for navigation
 */
import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
    key: string;
    ctrlOrCmd?: boolean;
    shift?: boolean;
    alt?: boolean;
    handler: () => void;
    description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            for (const shortcut of shortcuts) {
                const ctrlOrCmdPressed =
                    (navigator.platform.includes('Mac')
                        ? event.metaKey
                        : event.ctrlKey) || false;
                const shiftPressed = event.shiftKey || false;
                const altPressed = event.altKey || false;

                const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
                const ctrlOrCmdMatches = (shortcut.ctrlOrCmd ?? false) === ctrlOrCmdPressed;
                const shiftMatches = (shortcut.shift ?? false) === shiftPressed;
                const altMatches = (shortcut.alt ?? false) === altPressed;

                if (keyMatches && ctrlOrCmdMatches && shiftMatches && altMatches) {
                    event.preventDefault();
                    shortcut.handler();
                    break;
                }
            }
        },
        [shortcuts]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

/**
 * Get the keyboard shortcut display text for current platform
 */
export function getShortcutText(shortcut: {
    key: string;
    ctrlOrCmd?: boolean;
    shift?: boolean;
    alt?: boolean;
}): string {
    const parts: string[] = [];
    const isMac = navigator.platform.includes('Mac');

    if (shortcut.ctrlOrCmd) {
        parts.push(isMac ? '⌘' : 'Ctrl');
    }
    if (shortcut.shift) {
        parts.push('⇧');
    }
    if (shortcut.alt) {
        parts.push(isMac ? '⌥' : 'Alt');
    }
    parts.push(shortcut.key.toUpperCase());

    return parts.join('+');
}
