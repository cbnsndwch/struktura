/**
 * Common utility functions for Struktura
 */

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

// Date utilities
export class DateUtils {
    static formatDate(date: Date, locale = 'en-US'): string {
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    static formatDateTime(date: Date, locale = 'en-US'): string {
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    static isToday(date: Date): boolean {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    static addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
}

// Object utilities
export class ObjectUtils {
    static deepClone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }

    static isEmpty(obj: Record<string, any>): boolean {
        return Object.keys(obj).length === 0;
    }

    static pick<T extends Record<string, any>, K extends keyof T>(
        obj: T,
        keys: K[]
    ): Pick<T, K> {
        const result = {} as Pick<T, K>;
        keys.forEach(key => {
            if (key in obj) {
                result[key] = obj[key];
            }
        });
        return result;
    }

    static omit<T extends Record<string, any>, K extends keyof T>(
        obj: T,
        keys: K[]
    ): Omit<T, K> {
        const result = { ...obj };
        keys.forEach(key => {
            delete result[key];
        });
        return result;
    }
}

// Validation utilities
export class ValidationUtils {
    static isEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    static isUuid(value: string): boolean {
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value);
    }

    static isMongoId(value: string): boolean {
        const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
        return mongoIdRegex.test(value);
    }
}
