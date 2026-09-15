import isPlainObject from 'lodash/isPlainObject.js';
import mergeWith from 'lodash/mergeWith.js';

import type { MergeArrayStrategies } from '../index.js';
import mergeArrays from './merge-arrays.js';

type MutableObject = Record<PropertyKey, unknown>;

/**
 * Deeply merges one or more sources into a target object.
 *
 * The target and nested target values may be mutated. Array strategies only run when the
 * existing target value is an array; otherwise Lodash retains control of the merge.
 *
 * Adapted from Lando's `utils/merge.js` at commit
 * 9cc398d21bf35b8662a199fb9815024d24d599c1 under the MIT License.
 */
export default function merge(
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
        return mergeArrays(objectValue, sourceValue, `merge:${by}`);
      }

      return mergeArrays(objectValue, sourceValue, fallback);
    }

    return mergeArrays(objectValue, sourceValue, strategy);
  }) as MutableObject;
}
