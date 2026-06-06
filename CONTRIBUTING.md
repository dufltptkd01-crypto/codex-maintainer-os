# Contributing

Thanks for helping make open-source maintenance less exhausting.

## Local Setup

```bash
pnpm install
pnpm check
```

## Development Rules

- Keep source files focused and small.
- Add tests for every user-visible behavior.
- Parse external input with Zod at the boundary.
- Prefer deterministic heuristics before adding model-dependent behavior.
- Keep generated maintainer output clear enough to paste into GitHub issues, PRs, or release notes.

## Pull Request Checklist

- The CLI still works through `bun run src/cli.ts analyze --input examples/sample-items.json`.
- `pnpm check` passes.
- New behavior is covered by tests.
- README or examples are updated when the user-facing surface changes.
