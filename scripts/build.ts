import { spawnSync } from 'node:child_process';
import { copyFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const dist = join(root, 'dist');

function run(arguments_: string[]): void {
  const result = spawnSync(process.execPath, arguments_, {
    cwd: root,
    encoding: 'utf8',
    stdio: 'inherit',
  });

  if (result.status !== 0) process.exit(result.status ?? 1);
}

rmSync(dist, { force: true, recursive: true });
run([
  'build',
  './index.ts',
  '--target=node',
  '--format=esm',
  '--packages=external',
  '--outfile=dist/index.js',
]);
run([
  'build',
  './index.ts',
  '--target=node',
  '--format=cjs',
  '--packages=external',
  '--outfile=dist/index.cjs',
]);
run(['./node_modules/typescript/bin/tsc', '--project', 'tsconfig.build.json']);

copyFileSync(join(dist, 'index.d.ts'), join(dist, 'index.d.mts'));
copyFileSync(join(dist, 'index.d.ts'), join(dist, 'index.d.cts'));
rmSync(join(dist, 'utils'), { force: true, recursive: true });
