import { describe, expect, test } from "bun:test"

import { resolveGitHubToken } from "../src/auth.js"

describe("GitHub token resolution", () => {
  test("prefers the explicit CLI token when both CLI and environment tokens exist", () => {
    // Given: a maintainer passes an explicit token and also has GITHUB_TOKEN in the environment.
    const env = {
      GITHUB_TOKEN: "env-token",
    }

    // When: the CLI resolves the token for a GitHub request.
    const token = resolveGitHubToken({ token: "cli-token" }, env)

    // Then: the explicit token wins for predictable command behavior.
    expect(token).toBe("cli-token")
  })

  test("uses GITHUB_TOKEN when the CLI token is not provided", () => {
    // Given: a maintainer relies on the safer environment-token path.
    const env = {
      GITHUB_TOKEN: "env-token",
    }

    // When: the CLI resolves credentials for a GitHub request.
    const token = resolveGitHubToken({}, env)

    // Then: the environment token is used without requiring --token in shell history.
    expect(token).toBe("env-token")
  })
})
