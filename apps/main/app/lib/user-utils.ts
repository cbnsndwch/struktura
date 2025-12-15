/**
 * Get initials from user name
 * @param name - User's full name
 * @returns Initials (e.g., "John Doe" -> "JD", "Jane" -> "J")
 */
export function getInitials(name?: string | null): string {
    if (!name) {
        return 'U';
    }

    const parts = name.trim().split(/\s+/) || [];
    const first = parts.at(0) || '';
    const last = parts.at(-1) || '';

    if (parts.length === 1 && first.length) {
        return first.charAt(0).toUpperCase();
    }

    const firstChar = first.charAt(0) || '';
    const lastChar = last.charAt(0) || '';

    return (firstChar + lastChar).toUpperCase();
}
