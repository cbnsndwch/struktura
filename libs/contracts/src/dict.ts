/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * A generic dictionary type that maps string keys to values of type T.
 *
 * @template T - The type of values stored in the dictionary. Defaults to `any`.
 *
 * @example
 * ```typescript
 * const userRoles: Dict<string> = {
 *   "admin": "administrator",
 *   "user": "regular user"
 * };
 *
 * const config: Dict = {
 *   "timeout": 5000,
 *   "retries": 3,
 *   "debug": true
 * };
 * ```
 */
export type Dict<T = any> = {
    [key: string]: T;
};
