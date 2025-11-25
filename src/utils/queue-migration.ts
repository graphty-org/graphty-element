import type {OperationCategory, OperationContext} from "../managers/OperationQueueManager";

export interface QueueableOptions {
    /**
     * Skip the operation queue and execute immediately (for backwards compatibility)
     */
    skipQueue?: boolean;

    /**
     * Custom description for the operation (for debugging/logging)
     */
    description?: string;

    /**
     * Categories that this operation should obsolete
     */
    obsoletes?: OperationCategory[];

    /**
     * Whether to respect progress when obsoleting (don't cancel >90% complete)
     */
    respectProgress?: boolean;
}

export interface RunAlgorithmOptions extends QueueableOptions {
    /**
     * Automatically apply suggested styles after running the algorithm
     */
    applySuggestedStyles?: boolean;
}

/**
 * Helper to wrap a method with queue support while maintaining backwards compatibility
 */
export function wrapWithQueue<T extends (... args: unknown[]) => unknown>(
    queueOperation: (category: OperationCategory, execute: (context: OperationContext) => Promise<void> | void, metadata?: Record<string, unknown>) => string,
    category: OperationCategory,
    method: T,
    getDescription?: (... args: Parameters<T>) => string,
): T {
    return (async(... args: Parameters<T>): Promise<ReturnType<T>> => {
        // Check if last argument contains queue options
        const lastArg = args[args.length - 1];
        const hasQueueOptions = lastArg && typeof lastArg === "object" &&
            ("skipQueue" in lastArg || "description" in lastArg || "obsoletes" in lastArg);

        const options: QueueableOptions = hasQueueOptions ? (lastArg as QueueableOptions) : {};

        if (options.skipQueue) {
            // Execute directly without queuing
            return method(... args) as ReturnType<T>;
        }

        // Default description if not provided
        const description = options.description ?? (getDescription ? getDescription(... args) : undefined);

        // Queue the operation
        return new Promise((resolve, reject) => {
            queueOperation(
                category,
                async(context) => {
                    try {
                        // Check for cancellation
                        if (context.signal.aborted) {
                            reject(new Error("Operation cancelled"));
                            return;
                        }

                        const result = await method(... args);
                        resolve(result as ReturnType<T>);
                    } catch (error) {
                        reject(error instanceof Error ? error : new Error(String(error)));
                    }
                },
                {
                    description,
                    obsoletes: options.obsoletes,
                    respectProgress: options.respectProgress,
                },
            );
        });
    }) as T;
}

/**
 * Helper to create a batch operation context
 */
export class BatchOperationContext {
    private operations: (() => Promise<void>)[] = [];

    add(operation: () => Promise<void>): void {
        this.operations.push(operation);
    }

    async execute(): Promise<void> {
        for (const operation of this.operations) {
            await operation();
        }
    }

    get count(): number {
        return this.operations.length;
    }
}
