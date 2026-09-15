import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { format, resolveConfig } from 'prettier';
import { Application } from 'typedoc';
import type { PluginOptions } from 'typedoc-plugin-markdown';

const root = resolve(import.meta.dirname, '..');
const output = await mkdtemp(join(tmpdir(), 'merge-api-'));
const check = process.argv.includes('--check');

try {
  const app = await Application.bootstrapWithPlugins({
    outputs: [{ name: 'markdown', path: output }],
    entryPoints: [join(root, 'index.ts')],
    tsconfig: join(root, 'tsconfig.json'),
    plugin: ['typedoc-plugin-markdown'],
    readme: 'none',
    name: '@tanaab/merge API',
    disableSources: true,
    excludePrivate: true,
    excludeInternal: true,
    intentionallyNotExported: ['MergeSources', 'MergeResult'],
    router: 'module',
    ...({
      entryFileName: 'API',
      hidePageHeader: true,
      hidePageTitle: true,
      hideBreadcrumbs: true,
      useCodeBlocks: true,
      parametersFormat: 'table',
    } satisfies PluginOptions),
  });
  const project = await app.convert();
  if (!project) throw new Error('API documentation conversion failed.');
  app.validate(project);
  if (app.logger.hasErrors() || app.logger.hasWarnings()) {
    throw new Error('API documentation contains errors or warnings.');
  }
  await app.generateOutputs(project);
  if (app.logger.hasErrors() || app.logger.hasWarnings()) {
    throw new Error('API documentation rendering contains errors or warnings.');
  }
  const generated = await readFile(join(output, 'API.md'), 'utf8');
  const intro =
    '# API reference\n\nPublic exports for library consumers. See the [README](README.md) for installation and a quick start.\n\n<!-- Generated from TypeScript documentation by bun run docs. Do not edit directly. -->\n\n';
  const content = await format(intro + generated, {
    ...(await resolveConfig(join(root, 'API.md'))),
    filepath: 'API.md',
  });
  const destination = join(root, 'API.md');
  if (check) {
    if ((await readFile(destination, 'utf8')) !== content) {
      throw new Error('API.md is stale; run bun run docs.');
    }
  } else {
    await writeFile(destination, content);
  }
} finally {
  await rm(output, { force: true, recursive: true });
}
