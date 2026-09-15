import isPlainObject from 'lodash/isPlainObject.js';
import lodashMerge from 'lodash/merge.js';

/**
 * Array handling vocabulary. `replace` merges indexes; it does not replace the whole array.
 * `merge` uses `id`; `merge:<key>` selects a different identity property.
 */
export type ArrayMergeStrategy =
  'aoa' | 'concat' | 'first' | 'last' | 'merge' | `merge:${string}` | 'replace';

/** The callable public contract of `mergeArrays`. */
export type MergeArrays = typeof mergeArrays;

/**
 * Combines two mutable arrays using a named strategy.
 *
 * | Strategy | Behavior |
 * | --- | --- |
 * | `replace` | Lodash-merges indexes into the first array, preserving unmatched trailing entries. |
 * | `concat` | Returns a new outer array containing both inputs' entries. |
 * | `first` | Returns the first array unchanged by reference. |
 * | `last` | Returns the second array unchanged by reference. |
 * | `aoa` | Nests both arrays when the first has one item; otherwise appends the second array. |
 * | `merge` / `merge:<key>` | Merges entries by `id` or the named property into a new outer array. |
 *
 * Keyed merging expects plain objects with stable unique identifiers. A one-key object without
 * the requested identifier uses its sole key; other missing identifiers can collide through
 * JavaScript property-key coercion. A new outer array does not promise a deep clone.
 * Unsupported inputs retain incidental Lodash/native-array behavior, not a validation contract.
 *
 * @param firstArray - First mutable array; `replace` mutates it and may mutate its nested values.
 * @param secondArray - Second mutable array; `last` returns it directly.
 * @param arrayMergeStrategy - Strategy to apply. Defaults to `replace`.
 * @returns The selected input for `first`/`last`, the mutated first input for `replace`, or a new
 * outer array for `concat`, `aoa`, and keyed merging.
 * @example
 * ```ts
 * mergeArrays([1, 2], [3], 'concat'); // [1, 2, 3]
 * mergeArrays([{ id: 'app', port: 80 }], [{ id: 'app', secure: true }], 'merge:id');
 * // [{ id: 'app', port: 80, secure: true }]
 * ```
 */
function mergeArrays<First extends unknown[], Second extends unknown[]>(
  firstArray: First,
  secondArray: Second,
  arrayMergeStrategy: 'first',
): First;
/**
 * Selects the second input unchanged.
 * @param firstArray - First mutable array.
 * @param secondArray - Array to return by reference.
 * @param arrayMergeStrategy - `last` selects the second array.
 * @returns The second array without cloning or mutation.
 */
function mergeArrays<First extends unknown[], Second extends unknown[]>(
  firstArray: First,
  secondArray: Second,
  arrayMergeStrategy: 'last',
): Second;
/**
 * Groups the inputs without cloning their entries.
 * @param firstArray - A single-item array is nested whole; other lengths are spread into the result.
 * @param secondArray - Array appended as one nested element.
 * @param arrayMergeStrategy - `aoa` selects array-of-arrays handling.
 * @returns A new outer array containing the grouped inputs.
 */
function mergeArrays<First extends unknown[], Second extends unknown[]>(
  firstArray: First,
  secondArray: Second,
  arrayMergeStrategy: 'aoa',
): Array<First[number] | First | Second>;
/**
 * Combines entries using index merging, concatenation, or keyed merging.
 * @param firstArray - Mutable first array; `replace` mutates it and may mutate nested values.
 * @param secondArray - Mutable second array supplying entries to merge or append.
 * @param arrayMergeStrategy - Defaults to `replace`; `merge` defaults to identity key `id`.
 * @returns The first array for `replace`, or a new outer array for `concat` and keyed merging.
 */
function mergeArrays<First extends unknown[], Second extends unknown[]>(
  firstArray: First,
  secondArray: Second,
  arrayMergeStrategy?: Exclude<ArrayMergeStrategy, 'aoa' | 'first' | 'last'>,
): Array<First[number] | Second[number]>;
// Adapted from Lando commit 9cc398d21bf35b8662a199fb9815024d24d599c1 under the MIT License.
function mergeArrays(
  firstArray: unknown[],
  secondArray: unknown,
  arrayMergeStrategy: ArrayMergeStrategy = 'replace',
): unknown {
  const [strategy = '', requestedBy] = arrayMergeStrategy.split(':');
  const by = requestedBy || 'id';

  switch (strategy) {
    case 'aoa':
      return firstArray.length === 1 ? [firstArray, secondArray] : [...firstArray, secondArray];
    case 'concat':
      return firstArray.concat(secondArray);
    case 'first':
      return firstArray;
    case 'last':
      return secondArray;
    case 'merge':
      return Object.entries(
        [firstArray, secondArray].filter(Boolean).reduce<Record<PropertyKey, unknown>>(
          (accumulator, datum) =>
            lodashMerge(
              accumulator,
              Object.fromEntries(
                (datum as unknown[]).map((element) => {
                  if (isPlainObject(element)) {
                    const object = element as Record<PropertyKey, unknown>;
                    if (Object.prototype.hasOwnProperty.call(object, by)) {
                      return [object[by], object];
                    }
                    if (Object.keys(object).length === 1) return [Object.keys(object)[0], object];
                  }

                  return [element, element];
                }),
              ),
            ),
          {},
        ),
      ).map(([, data]) => data);
    case 'replace':
    default:
      return lodashMerge(firstArray, secondArray);
  }
}

export default mergeArrays;
