import isPlainObject from 'lodash/isPlainObject.js';
import mergeWith from 'lodash/mergeWith.js';

import mergeArrays from './merge-arrays.js';
import type { ArrayMergeStrategy } from './merge-arrays.js';

/** Primary array strategy and optional fallback for target arrays without plain objects. */
export type MergeArrayStrategies =
  ArrayMergeStrategy | readonly [ArrayMergeStrategy, ArrayMergeStrategy?];

/** The callable public contract of `merge`. */
export type Merge = typeof merge;

type RequiredKeys<Value> = {
  [Key in keyof Value]-?: object extends Pick<Value, Key> ? never : Key;
}[keyof Value];

type MergeValue<Target, Source> = Target extends readonly unknown[]
  ? Target | Source
  : Source extends readonly unknown[]
    ? Target | Source
    : Target extends object
      ? Source extends object
        ? MergeResult<Target, Source>
        : Target | Source
      : Target | Source;

type ValueAt<Target, Source, Key extends PropertyKey> = Key extends keyof Source
  ? Key extends keyof Target
    ? MergeValue<Target[Key], Source[Key]>
    : Source[Key]
  : Key extends keyof Target
    ? Target[Key]
    : never;

type MergeResult<Target, Source> = {
  [Key in RequiredKeys<Target> | RequiredKeys<Source>]: ValueAt<Target, Source, Key>;
} & {
  [
    Key in Exclude<keyof Target | keyof Source, RequiredKeys<Target> | RequiredKeys<Source>>
  ]?: ValueAt<Target, Source, Key>;
};

type MergeSources<Target, Sources extends readonly object[]> = Sources extends readonly [
  infer First extends object,
  ...infer Rest extends readonly object[],
]
  ? MergeSources<MergeResult<Target, First>, Rest>
  : Sources extends readonly []
    ? Target
    : MergeResult<Target, Partial<Sources[number]>>;

type MutableObject = Record<PropertyKey, unknown>;

/**
 * Deeply merges one or more sources into a mutable target, from left to right.
 *
 * Array strategies run only when the existing target value is an array; otherwise Lodash's
 * `mergeWith` controls the merge. With the default primary strategy, target arrays containing
 * plain objects merge by `id`; other target arrays use the fallback. `replace` means Lodash's
 * index-based merge, not whole-array replacement. See `mergeArrays` for strategy behavior.
 *
 * Return types preserve additive properties and conservatively union conflicting values; they
 * do not model every strategy's overwrite behavior. Unsupported inputs retain incidental
 * Lodash/native-array behavior, not a validation or coercion contract.
 *
 * @param object - Mutable target. The target and its nested values may be mutated.
 * @param sources - One source object or an ordered array of source objects. An empty array is a no-op.
 * @param arrayMergeStrategies - Primary strategy or `[primary, fallback]` tuple. Defaults to
 * `['merge:id', 'replace']`; an omitted fallback is `replace`. An empty tuple is unsupported.
 * @returns The same target object, with source values deeply merged into it.
 * @example
 * ```ts
 * merge({ tags: ['stable'] }, { tags: ['preview'] }, 'concat');
 * // { tags: ['stable', 'preview'] }
 * ```
 */
function merge<Target extends object, Sources extends readonly object[]>(
  object: Target,
  sources: Sources,
  arrayMergeStrategies?: MergeArrayStrategies,
): MergeSources<Target, Sources>;
/**
 * Merges one source into the target using the same strategy and mutation rules as the source-list overload.
 * @param object - Mutable target; nested target values may also change.
 * @param sources - One source object to merge into the target.
 * @param arrayMergeStrategies - Strategy or `[primary, fallback]`; defaults to `['merge:id', 'replace']`.
 * @returns The same target object. Conflicting value types remain conservative unions.
 */
function merge<Target extends object, Source extends object>(
  object: Target,
  sources: Source,
  arrayMergeStrategies?: MergeArrayStrategies,
): MergeResult<Target, Source>;
// Adapted from Lando commit 9cc398d21bf35b8662a199fb9815024d24d599c1 under the MIT License.
function merge(
  object: MutableObject,
  sources: object | readonly object[],
  arrayMergeStrategies: MergeArrayStrategies = ['merge:id', 'replace'],
): MutableObject {
  const normalizedSources = Array.isArray(sources) ? sources : [sources];
  const normalizedStrategies = Array.isArray(arrayMergeStrategies)
    ? arrayMergeStrategies
    : [arrayMergeStrategies];
  const [strategy = '', requestedBy] = normalizedStrategies[0].split(':');
  const by = requestedBy || 'id';
  const fallback = normalizedStrategies[1] || 'replace';

  return mergeWith(object, ...normalizedSources, (objectValue: unknown, sourceValue: unknown) => {
    if (!Array.isArray(objectValue) || strategy === 'replace') return undefined;

    if (strategy === 'merge') {
      if (objectValue.some((element) => isPlainObject(element))) {
        return mergeArrays(objectValue, sourceValue as unknown[], `merge:${by}`);
      }

      return mergeArrays(objectValue, sourceValue as unknown[], fallback);
    }

    return mergeArrays(objectValue, sourceValue as unknown[], strategy);
  }) as MutableObject;
}

export default merge;
