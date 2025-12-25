/**
 * Logging sinks for graphty-element.
 * @module logging/sinks
 */

// Re-export types from parent
export type {LogRecord, Sink} from "../types.js";

// Sink implementations
export {type ConsoleSinkOptions, createConsoleSink} from "./ConsoleSink.js";
export {createRemoteSink, type RemoteSinkOptions} from "./RemoteSink.js";
