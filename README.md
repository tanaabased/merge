<h1 align="center">@tanaab/merge</h1>

<p align="center">
  Deep object merging with configurable array strategies—concatenate, select, merge by key, or merge by index—for Bun, Node.js, and TypeScript.
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

The package supports Bun 1.3.10 or newer and Node.js 24 or newer.

## Usage

```ts
import { merge, mergeArrays } from '@tanaab/merge';

const config = merge({ service: { host: 'localhost' } }, { service: { port: 8080 } });
// { service: { host: 'localhost', port: 8080 } }

const tags = mergeArrays(['stable'], ['preview'], 'concat');
// ['stable', 'preview']
```

`merge` mutates and returns its target. Its default array strategy is `['merge:id', 'replace']`:
existing target arrays containing plain objects merge by `id`; other arrays use Lodash's index-based merge.
`replace` preserves unmatched trailing entries; it does not replace the whole array.

See [API.md](API.md) for all public exports, parameters, return values, strategies, and mutation limits.

Stable releases update both `latest` and `edge`; prereleases update only `edge`.
Use `@tanaab/merge@edge` to follow the newest release, including prereleases.

## Development

```sh
bun install --frozen-lockfile --ignore-scripts
bun run lint
bun run typecheck
bun run test
bun run docs:check
bun run test:package
```

`test:package` requires Node and npm and tests an isolated installation of the built tarball.
Regenerate the API reference after public documentation changes with `bun run docs`.

## Issues, Questions and Support

Use the [issue queue](https://github.com/tanaabased/merge/issues) to report bugs, request features, or ask project questions.

## Changelog

See [CHANGELOG.md](https://github.com/tanaabased/merge/blob/main/CHANGELOG.md) and the [GitHub releases](https://github.com/tanaabased/merge/releases) for published changes.

## Maintainers

- [@pirog](https://github.com/pirog)

## Contributors

<a href="https://github.com/tanaabased/merge/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=tanaabased/merge" alt="Merge contributors" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

## License

`@tanaab/merge` is licensed under the [MIT License](./LICENSE).
