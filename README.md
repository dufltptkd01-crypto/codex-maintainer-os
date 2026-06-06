# Codex Maintainer OS

Codex Maintainer OS turns GitHub issues and pull requests into a Codex-ready operating brief for open-source maintainers.

It is designed for maintainers who need less backlog theater and more executable work: verified security patches, release blockers, PR reviews, bug reproducers, and docs fixes.

## What It Does

- Reads an offline backlog JSON file or live GitHub issues and PRs.
- Classifies work into Codex lanes:
  - `security_patch`
  - `release_guardian`
  - `pr_review`
  - `issue_reproducer`
  - `docs_guardian`
- Produces a maintainer brief with priority counts, estimated time saved, suggested labels, and Codex task prompts.
- Supports Markdown for maintainers and JSON for automation.

## Quick Start

```bash
pnpm install
bun run src/cli.ts analyze --input examples/sample-items.json
```

Write a JSON report:

```bash
bun run src/cli.ts analyze \
  --input examples/sample-items.json \
  --format json \
  --output maintainer-os-report.json
```

Analyze a public GitHub repository:

```bash
bun run src/cli.ts analyze \
  --repo openai/openai-node \
  --format markdown \
  --output maintainer-os-report.md
```

Use a token for private repositories or higher rate limits:

```bash
GITHUB_TOKEN="$GITHUB_TOKEN" bun run src/cli.ts analyze --repo owner/repo
```

You can still pass `--token` for one-off use, but `GITHUB_TOKEN` avoids putting secrets in shell history.

## GitHub Action

Codex Maintainer OS can run as a scheduled GitHub Action:

```yaml
- uses: dufltptkd01-crypto/codex-maintainer-os@main
  with:
    repo: ${{ github.repository }}
    output: maintainer-os-report.md
    token: ${{ secrets.GITHUB_TOKEN }}
```

See [docs/github-action.md](docs/github-action.md) for a complete workflow.

## Example Output

```text
# Codex Maintainer OS Brief

Generated: 2026-06-06T00:00:00.000Z
Items analyzed: 4
Estimated maintainer time saved: 320 minutes

## Codex Task Queue

| Item | Priority | Lane | Title | Command |
| #42 | Critical | Security Patch | Potential token leak in debug logs | `codex task issue-42-security-patch` |
```

## Why This Exists

Open-source maintainers often spend more time deciding what work is real than doing the work itself. Codex Maintainer OS makes that decision layer explicit:

- Security reports become verification and patch tasks.
- Regressions become release-guardian tasks.
- Pull requests become review tasks with compatibility and test checks.
- Bug issues become failing-test or reproducer tasks.
- Stale docs become verified docs-guardian tasks.

The long-term goal is to make Codex a practical maintainer co-pilot that works through the real surface area of open source: GitHub issues, PRs, CI, release notes, and security patches.

## Input Format

```json
{
  "items": [
    {
      "number": 42,
      "title": "Potential token leak in debug logs",
      "body": "Authorization tokens may be exposed in CI logs.",
      "labels": ["security", "bug"],
      "state": "open",
      "itemType": "issue",
      "comments": 3
    }
  ]
}
```

`itemType` can be `issue` or `pull_request`.

## Development

```bash
pnpm install
pnpm check
```

The check command runs:

- `biome check .`
- `tsc --noEmit`
- `bun test`

## Roadmap

- Model-assisted issue summaries and reproducer prompts.
- GitHub issue comment drafts for maintainer approval.
- GitHub Actions scheduled backlog reports.
- PR diff ingestion and richer review heuristics.
- Release-note and changelog generation.
- Codex task package export for multi-agent worktrees.

## License

MIT
