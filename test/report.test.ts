import { describe, expect, test } from "bun:test"

import { buildMaintainerBrief } from "../src/brief.js"
import { renderMarkdownBrief } from "../src/report.js"
import { MaintainerItemsFileSchema } from "../src/schemas.js"

describe("markdown report", () => {
  test("renders a maintainer-facing brief when a backlog is analyzed", () => {
    // Given: a backlog with one high-signal security issue.
    const items = MaintainerItemsFileSchema.parse({
      items: [
        {
          number: 42,
          title: "Potential token leak in debug logs",
          body: "Authorization tokens may be exposed in CI logs.",
          labels: ["security"],
          state: "open",
          itemType: "issue",
          comments: 3,
        },
      ],
    }).items
    const brief = buildMaintainerBrief(items, {
      generatedAt: "2026-06-06T00:00:00.000Z",
    })

    // When: the Markdown surface is rendered.
    const markdown = renderMarkdownBrief(brief)

    // Then: the report exposes both the operating signal and Codex task queue.
    expect(markdown).toContain("# Codex Maintainer OS Brief")
    expect(markdown).toContain("| security_patch | 1 |")
    expect(markdown).toContain("| Item | Priority | Lane | Title | Command |")
    expect(markdown).not.toContain("| | Item |")
    expect(markdown).toContain("## Codex Task Queue")
    expect(markdown).toContain("codex task issue-42-security-patch")
  })
})
