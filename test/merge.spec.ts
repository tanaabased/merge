import assert from 'node:assert/strict';

import { merge } from '../index.js';

describe('utils/merge', () => {
  it('should deeply merge multiple sources into the target', () => {
    const target = {
      service: { enabled: false, options: { host: 'localhost' } },
      untouched: true,
    };
    const result = merge(target, [
      { service: { enabled: true, options: { port: 8080 } } },
      { version: 2 },
    ] as const);

    assert.equal(result, target);
    assert.deepEqual(result, {
      service: { enabled: true, options: { host: 'localhost', port: 8080 } },
      untouched: true,
      version: 2,
    });
  });

  it('should merge object arrays by id by default', () => {
    const target = {
      services: [
        { id: 'app', options: { debug: false } },
        { id: 'database', engine: 'postgres' },
      ],
    };

    merge(target, {
      services: [
        { id: 'app', options: { port: 3000 } },
        { id: 'cache', engine: 'redis' },
      ],
    });

    assert.deepEqual(target.services, [
      { id: 'app', options: { debug: false, port: 3000 } },
      { id: 'database', engine: 'postgres' },
      { id: 'cache', engine: 'redis' },
    ]);
  });

  it('should use the fallback strategy for arrays without plain objects', () => {
    const target = { ports: [80, 443] };

    merge(target, { ports: [3000] });

    assert.deepEqual(target.ports, [3000, 443]);
  });

  it('should apply an explicit array strategy to nested data', () => {
    const target = { service: { hosts: ['app.internal'] } };

    merge(target, { service: { hosts: ['api.internal'] } }, 'concat');

    assert.deepEqual(target, {
      service: { hosts: ['app.internal', 'api.internal'] },
    });
  });

  it('should defer mismatched target values to Lodash', () => {
    const target: { value: string | string[] } = { value: 'old' };

    merge(target, { value: ['new'] });

    assert.deepEqual(target.value, ['new']);
  });

  it('should treat an empty source list as a no-op', () => {
    const target = { unchanged: true };

    assert.equal(merge(target, []), target);
    assert.deepEqual(target, { unchanged: true });
  });
});
