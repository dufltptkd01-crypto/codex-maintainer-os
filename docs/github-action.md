# GitHub Action Usage

Use Codex Maintainer OS as a scheduled repository health report.

```yaml
name: Codex Maintainer Brief

on:
  workflow_dispatch:
  schedule:
    - cron: "0 9 * * 1"

jobs:
  brief:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: dufltptkd01-crypto/codex-maintainer-os@main
        with:
          repo: ${{ github.repository }}
          output: maintainer-os-report.md
          token: ${{ secrets.GITHUB_TOKEN }}
      - uses: actions/upload-artifact@v4
        with:
          name: maintainer-os-report
          path: maintainer-os-report.md
```

The report classifies open issues and pull requests into Codex-ready work lanes:

- `security_patch`
- `release_guardian`
- `pr_review`
- `issue_reproducer`
- `docs_guardian`

The output is Markdown so maintainers can paste it into release planning notes, weekly maintainer updates, or issue triage sessions.
