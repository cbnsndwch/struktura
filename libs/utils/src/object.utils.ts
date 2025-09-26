import type { Dict } from '@cbnsndwch/struktura-shared-contracts';

// Object utilities
export class ObjectUtils {
    static deepClone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }

    static isEmpty(obj: Dict): boolean {
        return Object.keys(obj).length === 0;
    }

    static pick<T extends Dict, K extends keyof T>(
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

    static omit<T extends Dict, K extends keyof T>(
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
