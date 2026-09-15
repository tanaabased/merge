import assert from 'node:assert/strict';

import { merge } from '../index.ts';

describe('utils/merge', () => {
  it('should combine own enumerable properties from left to right', () => {
    assert.deepEqual(merge({ name: 'Leia', status: 'draft' }, { status: 'ready' }), {
      name: 'Leia',
      status: 'ready',
    });
  });
});
