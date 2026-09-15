import mergeFunction from './utils/merge.js';
import mergeArraysFunction from './utils/merge-arrays.js';

type UnionToIntersection<Union> = (
  Union extends unknown ? (argument: Union) => void : never
) extends (argument: infer Intersection) => void
  ? Intersection
  : never;

export type ArrayMergeStrategy =
  'aoa' | 'concat' | 'first' | 'last' | 'merge' | `merge:${string}` | 'replace';

export type MergeArrayStrategies =
  ArrayMergeStrategy | readonly [primary: ArrayMergeStrategy, fallback?: ArrayMergeStrategy];

export interface Merge {
  <Target extends object, Sources extends readonly object[]>(
    target: Target,
    sources: Sources,
    arrayMergeStrategies?: MergeArrayStrategies,
  ): Target & UnionToIntersection<Sources[number]>;
  <Target extends object, Source extends object>(
    target: Target,
    source: Source,
    arrayMergeStrategies?: MergeArrayStrategies,
  ): Target & Source;
}

export interface MergeArrays {
  <First extends unknown[], Second extends unknown[]>(
    first: First,
    second: Second,
    strategy: 'first',
  ): First;
  <First extends unknown[], Second extends unknown[]>(
    first: First,
    second: Second,
    strategy: 'last',
  ): Second;
  <First extends unknown[], Second extends unknown[]>(
    first: First,
    second: Second,
    strategy: 'aoa',
  ): Array<First[number] | First | Second>;
  <First extends unknown[], Second extends unknown[]>(
    first: First,
    second: Second,
    strategy?: Exclude<ArrayMergeStrategy, 'aoa' | 'first' | 'last'>,
  ): Array<First[number] | Second[number]>;
}

export const merge = mergeFunction as Merge;
export const mergeArrays = mergeArraysFunction as MergeArrays;
