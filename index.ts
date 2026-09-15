import mergeFunction from './utils/merge.js';
import mergeArraysFunction from './utils/merge-arrays.js';

// Keep value bindings so Bun's bundler retains both implementations.
export const merge = mergeFunction;
export const mergeArrays = mergeArraysFunction;
export type { Merge, MergeArrayStrategies } from './utils/merge.js';
export type { ArrayMergeStrategy, MergeArrays } from './utils/merge-arrays.js';
