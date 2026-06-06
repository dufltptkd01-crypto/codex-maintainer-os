import { describe, expect, test } from "bun:test"

import { buildMaintainerBrief } from "../src/brief.js"
import { MaintainerItemsFileSchema } from "../src/schemas.js"

const sampleInput = {
  items: [
    {
      number: 42,
      title: "Potential token leak in debug logs",
      body: "Authorization tokens may be exposed in CI logs.",
      labels: ["security", "bug"],
      state: "open",
      itemType: "issue",
      comments: 3,
    },
    {
      number: 17,
      title: "Regression: patch release breaks Windows path handling",
      body: "This blocks the next release candidate.",
      labels: ["regression", "release-blocker"],
      state: "open",
      itemType: "issue",
      comments: 8,
    },
    {
      number: 51,
      title: "Add cache adapter for package metadata",
      body: "Needs compatibility review.",
      labels: ["enhancement"],
      state: "open",
      itemType: "pull_request",
      comments: 11,
    },
    {
      number: 8,
      title: "README install example is stale",
      body: "Quickstart references the old binary name.",
      labels: ["documentation"],
      state: "open",
      itemType: "issue",
      comments: 1,
    },
  ],
}

describe("maintainer triage", () => {
  test("builds a Codex work queue when mixed issues and PRs are analyzed", () => {
    // Given: a real maintainer backlog with security, release, PR, and docs work.
    const items = MaintainerItemsFileSchema.parse(sampleInput).items

    // When: Codex Maintainer OS builds the operating brief.
    const brief = buildMaintainerBrief(items, {
      generatedAt: "2026-06-06T00:00:00.000Z",
    })

    // Then: the highest-risk items become the highest-priority Codex tasks.
    expect(brief.totalItems).toBe(4)
    expect(brief.priorityCounts.critical).toBe(1)
    expect(brief.priorityCounts.high).toBe(1)
    expect(brief.priorityCounts.medium).toBe(1)
    expect(brief.priorityCounts.low).toBe(1)
    expect(brief.laneCounts.security_patch).toBe(1)
    expect(brief.laneCounts.release_guardian).toBe(1)
    expect(brief.laneCounts.pr_review).toBe(1)
    expect(brief.laneCounts.docs_guardian).toBe(1)
    expect(brief.estimatedMinutesSaved).toBe(320)
    expect(brief.tasks.map((task) => task.codexCommand)).toContain(
      "codex task issue-42-security-patch",
    )
  })
})
