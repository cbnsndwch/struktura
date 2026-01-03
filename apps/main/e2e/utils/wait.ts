/**
 * Helper to wait for async operations
 *
 * @param ms The number of milliseconds to wait for
 */
export function wait(ms: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, ms);
    });
}
