import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = join(import.meta.dirname, '..');
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'tanaab-merge-'));
const suppliedTarball = process.argv[2];
const tarball = suppliedTarball
  ? resolve(root, suppliedTarball)
  : join(temporaryDirectory, 'tanaab-merge.tgz');
const consumer = join(temporaryDirectory, 'consumer');

function run(command: string, arguments_: string[], cwd = root): string {
  const result = spawnSync(command, arguments_, { cwd, encoding: 'utf8' });
  const detail = [result.stdout, result.stderr].filter(Boolean).join('\n');

  assert.equal(result.status, 0, `${command} ${arguments_.join(' ')} failed\n${detail}`);
  return result.stdout;
}

try {
  if (!suppliedTarball) {
    const packed = run('npm', [
      'pack',
      '--ignore-scripts',
      '--pack-destination',
      temporaryDirectory,
      '--json',
    ]);
    const [artifact] = JSON.parse(packed) as Array<{ filename: string }>;
    assert.ok(artifact, 'npm pack must produce one tarball');
    renameSync(join(temporaryDirectory, artifact.filename), tarball);
  }

  const packageFiles = run('tar', ['-tzf', tarball])
    .trim()
    .split('\n')
    .filter((file) => !file.endsWith('/'))
    .sort();
  assert.deepEqual(packageFiles, [
    'package/API.md',
    'package/LICENSE',
    'package/README.md',
    'package/dist/index.cjs',
    'package/dist/index.d.cts',
    'package/dist/index.d.mts',
    'package/dist/index.d.ts',
    'package/dist/index.js',
    'package/dist/utils/merge-arrays.d.ts',
    'package/dist/utils/merge.d.ts',
    'package/package.json',
  ]);

  mkdirSync(consumer);
  writeFileSync(
    join(consumer, 'package.json'),
    `${JSON.stringify(
      {
        private: true,
        type: 'module',
        dependencies: { '@tanaab/merge': `file:${tarball}` },
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    join(consumer, 'consumer.mjs'),
    `import assert from 'node:assert/strict';
import { merge, mergeArrays } from '@tanaab/merge';

assert.deepEqual(merge({nested: {left: true}}, {nested: {right: true}}), {
  nested: {left: true, right: true},
});
assert.deepEqual(mergeArrays([1], [2], 'concat'), [1, 2]);
`,
  );
  writeFileSync(
    join(consumer, 'consumer.cjs'),
    `const assert = require('node:assert/strict');
const {merge, mergeArrays} = require('@tanaab/merge');

assert.deepEqual(merge({nested: {left: true}}, {nested: {right: true}}), {
  nested: {left: true, right: true},
});
assert.deepEqual(mergeArrays([1], [2], 'concat'), [1, 2]);
`,
  );
  writeFileSync(
    join(consumer, 'consumer.mts'),
    `import {merge, mergeArrays} from '@tanaab/merge';

const merged = merge({left: 1}, [{right: 'ready'}] as const);
merged.left.toFixed();
merged.right.toUpperCase();
mergeArrays([1], ['two'], 'last')[0]?.toUpperCase();
`,
  );
  writeFileSync(
    join(consumer, 'consumer.cts'),
    `import mergePackage = require('@tanaab/merge');

const merged = mergePackage.merge({left: 1}, [{right: 'ready'}] as const);
merged.left.toFixed();
merged.right.toUpperCase();
mergePackage.mergeArrays([1], ['two'], 'first')[0]?.toFixed();
`,
  );
  writeFileSync(
    join(consumer, 'tsconfig.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          noEmit: true,
          strict: true,
          target: 'ES2022',
        },
        include: ['consumer.mts', 'consumer.cts'],
      },
      null,
      2,
    )}\n`,
  );

  run(process.execPath, ['install', '--ignore-scripts'], consumer);
  run(process.execPath, ['./consumer.mjs'], consumer);
  run('node', ['./consumer.mjs'], consumer);
  run('node', ['./consumer.cjs'], consumer);
  run(
    process.execPath,
    [join(root, 'node_modules/typescript/bin/tsc'), '--project', 'tsconfig.json'],
    consumer,
  );

  const installedManifest = JSON.parse(
    readFileSync(join(consumer, 'node_modules/@tanaab/merge/package.json'), 'utf8'),
  ) as { name?: string };
  assert.equal(installedManifest.name, '@tanaab/merge');
} finally {
  rmSync(temporaryDirectory, { force: true, recursive: true });
}
