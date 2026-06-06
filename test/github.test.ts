import { describe, expect, test } from "bun:test"

import { GitHubIssueSchema, toMaintainerItem } from "../src/github.js"

describe("GitHub issue normalization", () => {
  test("accepts both string and object labels when GitHub issue data is normalized", () => {
    // Given: GitHub issue data includes the label forms seen across API examples and fixtures.
    const issue = GitHubIssueSchema.parse({
      body: "A regression blocks release.",
      comments: 2,
      created_at: "2026-06-06T00:00:00Z",
      html_url: "https://github.com/example/project/issues/5",
      labels: ["regression", { name: "release-blocker" }, { name: null }],
      number: 5,
      state: "open",
      title: "Release blocker",
      updated_at: "2026-06-06T01:00:00Z",
      user: { login: "maintainer" },
    })

    // When: the issue is converted into the maintainer item shape.
    const item = toMaintainerItem(issue)

    // Then: usable labels are preserved and null labels are discarded.
    expect(item.labels).toEqual(["regression", "release-blocker"])
  })
})
