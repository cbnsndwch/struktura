/**
 * User-related utility functions
 */

/**
 * Get initials from user name
 * @param name - User's full name
 * @returns Initials (e.g., "John Doe" -> "JD", "Jane" -> "J")
 */
export function getInitials(name?: string | null): string {
    if (!name) return 'U';
    
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
