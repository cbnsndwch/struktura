/**
 * Common UI utilities
 */
export class Utils {
    static formatDate(date: Date): string {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    static formatDateTime(date: Date): string {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    static classNames(
        ...classes: (string | undefined | null | false)[]
    ): string {
        return classes.filter(Boolean).join(' ');
    }

    static truncateText(text: string, maxLength: number): string {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }
}
