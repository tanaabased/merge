# @tanaab/merge

- Keep TypeScript and Bun code in the nearest owning scope; use `utils/` for independently testable functions and keep its flat tests in `test/`.
- Keep ESLint for static rules and standalone Prettier for formatting; keep `typecheck` separate from lint.
- Use Bun for package management and refresh `bun.lock` after manifest changes.
- Use focused Mocha specs; assert stable public contracts exactly and keep environment-sensitive checks outside the default unit suite.
