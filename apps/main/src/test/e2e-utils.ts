/**
 * E2E Test Utilities for Vitest Browser Mode
 * These utilities help test the actual running application
 */

/**
 * Wait for an element to appear in the DOM
 */
export async function waitForElement(
    selector: string,
    timeout = 5000
): Promise<Element> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        const element = document.querySelector(selector);
        if (element) return element;
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`Element "${selector}" not found within ${timeout}ms`);
}

/**
 * Wait for text content to appear
 */
export async function waitForText(
    text: string,
    timeout = 5000
): Promise<Element> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        const element = Array.from(document.querySelectorAll('*')).find(el =>
            el.textContent?.includes(text)
        );
        if (element) return element;
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`Text "${text}" not found within ${timeout}ms`);
}

/**
 * Navigate to a URL and wait for it to load
 */
export async function navigateTo(path: string): Promise<void> {
    window.location.href = path;
    await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * Fill an input field
 */
export function fillInput(selector: string, value: string): void {
    const input = document.querySelector(selector) as HTMLInputElement;
    if (!input) throw new Error(`Input "${selector}" not found`);

    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Click an element
 */
export function clickElement(selector: string): void {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) throw new Error(`Element "${selector}" not found`);

    element.click();
}

/**
 * Get element by test ID
 */
export function getByTestId(testId: string): Element | null {
    return document.querySelector(`[data-testid="${testId}"]`);
}

/**
 * Wait for element by test ID
 */
export async function waitForTestId(
    testId: string,
    timeout = 5000
): Promise<Element> {
    return waitForElement(`[data-testid="${testId}"]`, timeout);
}
