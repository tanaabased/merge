# @tanaab/merge

## Scope

- Own object and array merge utilities, their public TypeScript contracts, and npm delivery for Bun and Node.js 24+.
- Preserve the documented Lodash-derived mutation and array strategy behavior unless a semantic change is explicitly requested.
- Keep public exports in `index.ts`, implementation and its types in `utils/`, and focused flat specs in `test/`.

## Out of scope

- Configuration-file loading, schema validation or coercion, application configuration orchestration, and unrelated Lando functionality.
- New merge strategies or changes to inherited semantics as incidental cleanup.

## Development

- Use Bun for the repository runtime and package management; refresh `bun.lock` after manifest changes.
- Keep ESLint for static rules and standalone Prettier for formatting; keep `typecheck` separate from lint.
- Run focused Mocha unit tests under Bun. Keep build, packed-consumer, and Node compatibility checks in the release-test workflow.
- Use `.node-version` for the Node toolchain required by package compatibility checks and npm publication.
- Document public contracts beside their implementations. Generate `API.md` with `bun run docs`; never edit it by hand.
- Publish stable versions to `latest` and `edge`, and prereleases to `edge` only. Keep npm trusted publication tokenless and expose the granular npm token only to the dist-tag step.
