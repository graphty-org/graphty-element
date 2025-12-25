/**
 * Lazy evaluation utilities for zero-overhead logging.
 *
 * These helpers allow expensive computations to be deferred until they are
 * actually needed. When logging is disabled or the log level is filtered,
 * the expensive computation is never executed.
 * @example
 * ```typescript
 * import { lazy } from "graphty-element/logging";
 *
 * // Without lazy evaluation - expensive computation always runs
 * logger.debug("Data", { positions: computeExpensivePositions() });
 *
 * // With lazy evaluation - computation only runs if debug is enabled
 * logger.debug("Data", { positions: lazy(() => computeExpensivePositions()) });
 *
 * // Most efficient pattern: combine with level guard
 * if (logger.isDebugEnabled()) {
 *     logger.debug("Data", { positions: lazy(() => computeExpensivePositions()) });
 * }
 * ```
 * @module logging/LazyEval
 */

/**
 * Symbol to identify lazy evaluation wrappers.
 */
export const LAZY_SYMBOL = Symbol.for("graphty.lazy");

/**
 * A lazy wrapper that defers computation until the value is needed.
 * The computation result is cached after first evaluation.
 */
export interface LazyValue<T> {
    (): T;
    [LAZY_SYMBOL]: true;
}

/**
 * Wrap an expensive computation for lazy evaluation.
 *
 * The provided function will only be called when the lazy value is invoked.
 * After the first call, the result is cached and returned on subsequent calls.
 * @param fn - Function that computes the value
 * @returns A lazy wrapper function that computes and caches the value on first call
 * @example
 * ```typescript
 * // Basic usage
 * const lazyData = lazy(() => computeExpensiveData());
 * logger.debug("Expensive operation", { data: lazyData });
 *
 * // The lazy function can be called manually to get the value
 * const value = lazyData(); // Computes on first call
 * const cachedValue = lazyData(); // Returns cached value
 * ```
 * @remarks
 * **Performance Guidelines:**
 *
 * 1. **Use for expensive computations**: Only wrap computations that are
 *    expensive (serialization, large object traversal, etc.)
 *
 * 2. **Combine with level guards**: For maximum efficiency, use `isDebugEnabled()`
 *    or `isTraceEnabled()` guards to avoid even creating the lazy wrapper:
 *    ```typescript
 *    if (logger.isDebugEnabled()) {
 *        logger.debug("Data", { complex: lazy(() => serialize(node)) });
 *    }
 *    ```
 *
 * 3. **Avoid in hot paths**: Even the lazy wrapper creation has some overhead.
 *    In render loops or per-frame callbacks, use level guards without lazy.
 */
export function lazy<T>(fn: () => T): LazyValue<T> {
    let cached: T | undefined;
    let computed = false;

    const wrapper = (): T => {
        if (!computed) {
            cached = fn();
            computed = true;
        }

        return cached as T;
    };

    // Mark as lazy for identification
    (wrapper as LazyValue<T>)[LAZY_SYMBOL] = true;

    return wrapper as LazyValue<T>;
}

/**
 * Check if a value is a lazy wrapper.
 * @param value - The value to check
 * @returns true if the value is a lazy wrapper
 */
export function isLazy(value: unknown): value is LazyValue<unknown> {
    return typeof value === "function" && LAZY_SYMBOL in value;
}

/**
 * Resolve a potentially lazy value.
 * If the value is lazy, evaluate it. Otherwise, return as-is.
 * @param value - The value to resolve (may be lazy or regular)
 * @returns The resolved value
 */
export function resolveLazy<T>(value: T | LazyValue<T>): T {
    return isLazy(value) ? value() : value;
}

/**
 * Resolve all lazy values in a data object (one level deep).
 * This is used internally by the logger to resolve lazy values before logging.
 * @param data - Object that may contain lazy values
 * @returns A new object with all lazy values resolved
 */
export function resolveDataObject(data: Record<string, unknown>): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
        resolved[key] = isLazy(value) ? value() : value;
    }
    return resolved;
}
