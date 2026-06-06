# Security Policy

Codex Maintainer OS may process public or private GitHub issue data.

## Reporting Security Issues

Please open a private security advisory on GitHub when available. If that is not available, open an issue with a minimal description and avoid publishing secrets, tokens, private repository names, or exploit details.

## Token Handling

The CLI accepts a GitHub token through `--token`. It does not store tokens, write them to reports, or send them anywhere except GitHub's API.

When sharing reports, check issue titles and bodies for sensitive content first.
