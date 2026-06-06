# Maintainer Playbook

Codex Maintainer OS works best as a weekly operating loop.

## 1. Generate A Brief

```bash
GITHUB_TOKEN="$GITHUB_TOKEN" bun run src/cli.ts analyze \
  --repo owner/repo \
  --output maintainer-os-report.md
```

## 2. Review The Top Lane

Start with `security_patch` and `release_guardian` tasks. These lanes represent the highest maintainer risk because they can affect users, releases, and downstream packages.

## 3. Assign Codex Tasks

Copy one generated command and prompt into a Codex session. The prompt asks Codex to produce a concrete artifact such as a failing test, review note, patch, or release-note draft.

## 4. Keep The Human Gate

Codex Maintainer OS produces proposed work. Maintainers still approve labels, comments, patches, and release decisions before publishing changes.

## 5. Track Impact

Record how many items were triaged, how many tasks became tests or PRs, and how much maintainer time was saved. These metrics help show whether Codex is reducing maintenance load instead of adding another queue.
