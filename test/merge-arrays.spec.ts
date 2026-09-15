import assert from 'node:assert/strict';

import { mergeArrays } from '../index.js';

describe('utils/merge-arrays', () => {
  it('should use Lodash index merging for the default replace strategy', () => {
    const first = [{ left: true }, 'preserved'];
    const firstObject = first[0];
    const second = [{ right: true }];
    const result = mergeArrays(first, second);

    assert.equal(result, first);
    assert.equal(result[0], firstObject);
    assert.deepEqual(result, [{ left: true, right: true }, 'preserved']);
    assert.deepEqual(second, [{ right: true }]);
  });

  it('should use Lodash index merging for an explicit replace strategy', () => {
    const first = [1, 2, 3];

    assert.deepEqual(mergeArrays(first, [4], 'replace'), [4, 2, 3]);
    assert.deepEqual(first, [4, 2, 3]);
  });

  it('should concatenate without mutating either input', () => {
    const first = [1, 2];
    const second = [3, 4];

    assert.deepEqual(mergeArrays(first, second, 'concat'), [1, 2, 3, 4]);
    assert.deepEqual(first, [1, 2]);
    assert.deepEqual(second, [3, 4]);
  });

  it('should return the first input for the first strategy', () => {
    const first = [1];

    assert.equal(mergeArrays(first, [2], 'first'), first);
  });

  it('should return the second input for the last strategy', () => {
    const second = [2];

    assert.equal(mergeArrays([1], second, 'last'), second);
  });

  it('should nest both inputs when aoa receives a single first item', () => {
    const first = [1];
    const second = [2];

    assert.deepEqual(mergeArrays(first, second, 'aoa'), [[1], [2]]);
  });

  it('should append the second array when aoa receives multiple first items', () => {
    assert.deepEqual(mergeArrays([1, 2], [3], 'aoa'), [1, 2, [3]]);
  });

  it('should merge nested objects by the requested identity key', () => {
    const result = mergeArrays(
      [
        { name: 'app', options: { debug: false, ports: [80] } },
        { name: 'database', engine: 'postgres' },
      ],
      [
        { name: 'app', options: { ports: [443], workers: 2 } },
        { name: 'cache', engine: 'redis' },
      ],
      'merge:name',
    );

    assert.deepEqual(result, [
      { name: 'app', options: { debug: false, ports: [443], workers: 2 } },
      { name: 'database', engine: 'postgres' },
      { name: 'cache', engine: 'redis' },
    ]);
  });

  it('should use a sole object key when the requested identity is missing', () => {
    const result = mergeArrays(
      [{ alpha: { left: true } }, { beta: { value: 1 } }],
      [{ alpha: { right: true } }, { gamma: { value: 2 } }],
      'merge:id',
    );

    assert.deepEqual(result, [
      { alpha: { left: true, right: true } },
      { beta: { value: 1 } },
      { gamma: { value: 2 } },
    ]);
  });

  it('should preserve the inherited collision for multi-key objects without an identity', () => {
    const result = mergeArrays(
      [{ left: true, shared: { first: true } }],
      [{ right: true, shared: { second: true } }],
      'merge:id',
    );

    assert.deepEqual(result, [{ left: true, right: true, shared: { first: true, second: true } }]);
  });

  it('should handle empty arrays across merge and replace strategies', () => {
    assert.deepEqual(mergeArrays([], [], 'merge:id'), []);
    assert.deepEqual(mergeArrays([1], [], 'replace'), [1]);
  });

  it('should ignore a null second value for merge while concat appends it', () => {
    assert.deepEqual(mergeArrays([1], null as never, 'merge:id'), [1]);
    assert.deepEqual(mergeArrays([1], null as never, 'concat'), [1, null]);
  });
});
