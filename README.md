<h1 align="center">@tanaab/merge</h1>

<p align="center">
  Composable Lodash-backed object and array merge utilities for Bun, Node.js, and TypeScript.
</p>

<p align="center">
  <a href="https://github.com/tanaabased/merge/releases/latest"><img src="https://img.shields.io/github/v/release/tanaabased/merge" alt="Latest release" /></a>
  <a href="https://github.com/tanaabased/merge/actions/workflows/pr-linter.yml"><img src="https://img.shields.io/github/actions/workflow/status/tanaabased/merge/pr-linter.yml?event=pull_request&label=Lint" alt="Lint" /></a>
  <a href="https://github.com/tanaabased/merge/actions/workflows/pr-unit-tests.yml"><img src="https://img.shields.io/github/actions/workflow/status/tanaabased/merge/pr-unit-tests.yml?event=pull_request&label=Unit%20Tests" alt="Unit tests" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/tanaabased/merge" alt="MIT license" /></a>
</p>

## Overview

- `merge` deeply merges objects with configurable array handling.
- `mergeArrays` applies explicit array strategies such as concatenation, selection, keyed merging, and Lodash's index-based merge.
- The package ships native ESM, Node-compatible CommonJS, and TypeScript declarations without requiring Bun at runtime.

## Installation

Install with Bun:

```sh
bun add @tanaab/merge
```

Or install with npm:

```sh
npm install @tanaab/merge
```

The package supports Bun 1.3.10 or newer and Node.js 20 or newer.

## Merge objects

`merge(target, sources, arrayStrategies?)` deeply merges one source object or an array of source objects into `target` and returns that same target. Lodash's `mergeWith` owns ordinary object merging.

```ts
import { merge } from '@tanaab/merge';

const config = merge({ service: { host: 'localhost', ports: [80] } }, [
  { service: { ports: [443] } },
  { service: { secure: true } },
]);
```

The default array strategy is `['merge:id', 'replace']`: arrays containing plain objects merge by `id`; other arrays use Lodash's index-based merge. Pass a strategy or `[primary, fallback]` tuple to change that behavior.

```ts
merge({ tags: ['stable'] }, { tags: ['preview'] }, 'concat');
// {tags: ['stable', 'preview']}

merge(
  { services: [{ name: 'app', port: 80 }] },
  { services: [{ name: 'app', secure: true }] },
  'merge:name',
);
// {services: [{name: 'app', port: 80, secure: true}]}
```

## Merge arrays

`mergeArrays(first, second, strategy?)` applies one strategy directly:

| Strategy      | Behavior                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------- |
| `replace`     | Lodash-merges indexes from `second` into `first`; this is the default and mutates `first` |
| `concat`      | Returns `first.concat(second)`                                                            |
| `first`       | Returns `first` unchanged and by reference                                                |
| `last`        | Returns `second` unchanged and by reference                                               |
| `aoa`         | Nests both inputs when `first` has one item; otherwise appends `second`                   |
| `merge:<key>` | Merges array entries by the named object property; `merge` alone uses `id`                |

```ts
import { mergeArrays } from '@tanaab/merge';

mergeArrays([1, 2], [3], 'concat');
// [1, 2, 3]

mergeArrays([{ id: 'app', port: 80 }], [{ id: 'app', secure: true }], 'merge:id');
// [{id: 'app', port: 80, secure: true}]
```

## Input and mutation limits

- `merge` expects a mutable target object and either one source object or an array of source objects. An empty source array is a no-op. It mutates the target and may mutate nested target values.
- The optional strategy tuple must contain a primary strategy; an empty tuple is unsupported.
- `mergeArrays` is typed for two mutable arrays. `replace` mutates the first array and nested target values; `first` and `last` return an input directly. `aoa`, `concat`, and `merge:<key>` return a new outer array.
- `replace` means Lodash's index-based array merge, not whole-array replacement. Changing that inherited behavior would be a breaking semantic change.
- `merge:<key>` expects array entries to be plain objects with stable unique identifiers. A one-key object without the requested identifier uses its sole key; other missing identifiers can collide through JavaScript property-key coercion.
- Unsupported or mismatched values retain the pinned implementation's incidental Lodash and native-array behavior. Do not rely on that behavior as a validation or coercion API.

## Development

```sh
bun install --frozen-lockfile
bun run lint
bun run typecheck
bun run test
bun run test:package
```

## Issues, Questions and Support

Use the [issue queue](https://github.com/tanaabased/merge/issues) to report bugs, request features, or ask project questions.

## Changelog

See [CHANGELOG.md](https://github.com/tanaabased/merge/blob/main/CHANGELOG.md) and the [GitHub releases](https://github.com/tanaabased/merge/releases) for published changes.

## Provenance and License

The helpers are adapted from Lando's [`merge.js`](https://github.com/lando/core-next/blob/9cc398d21bf35b8662a199fb9815024d24d599c1/utils/merge.js) and [`merge-arrays.js`](https://github.com/lando/core-next/blob/9cc398d21bf35b8662a199fb9815024d24d599c1/utils/merge-arrays.js) at commit `9cc398d21bf35b8662a199fb9815024d24d599c1`. That source package declares the MIT License. See [LICENSE](LICENSE) for attribution and terms.
