import isPlainObject from 'lodash/isPlainObject.js';
import lodashMerge from 'lodash/merge.js';

import type { ArrayMergeStrategy } from '../index.js';

/**
 * Combines two arrays using a named strategy.
 *
 * `first` and `last` return an input directly, while `replace` mutates its first input through
 * Lodash's index-based merge. Other strategies return a new outer array.
 *
 * Adapted from Lando's `utils/merge-arrays.js` at commit
 * 9cc398d21bf35b8662a199fb9815024d24d599c1 under the MIT License.
 */
export default function mergeArrays(
  firstArray: unknown[],
  secondValue: unknown,
  arrayMergeStrategy: ArrayMergeStrategy = 'replace',
): unknown {
  const [strategy = '', requestedBy] = arrayMergeStrategy.split(':');
  const by = requestedBy || 'id';

  switch (strategy) {
    case 'aoa':
      return firstArray.length === 1 ? [firstArray, secondValue] : [...firstArray, secondValue];
    case 'concat':
      return firstArray.concat(secondValue);
    case 'first':
      return firstArray;
    case 'last':
      return secondValue;
    case 'merge':
      return Object.entries(
        [firstArray, secondValue].filter(Boolean).reduce<Record<PropertyKey, unknown>>(
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
      return lodashMerge(firstArray, secondValue);
  }
}
