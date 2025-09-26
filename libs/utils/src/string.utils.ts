// String utilities

export class StringUtils {
    static slugify(text: string): string {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    static capitalize(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    static truncate(text: string, length: number, suffix = '...'): string {
        if (text.length <= length) return text;
        return text.substring(0, length) + suffix;
    }

    static generateId(prefix = ''): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return prefix
            ? `${prefix}-${timestamp}-${random}`
            : `${timestamp}-${random}`;
    }
}
