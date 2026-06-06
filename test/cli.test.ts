import { describe, expect, test } from "bun:test"

import { MaintainerBriefSchema } from "../src/schemas.js"

async function streamToText(stream: ReadableStream<Uint8Array> | null): Promise<string> {
  if (stream === null) {
    return ""
  }

  return await new Response(stream).text()
}

describe("CLI", () => {
  test("emits a JSON brief when the analyze command receives a sample file", async () => {
    // Given: the CLI is driven through its public command surface.
    const process = Bun.spawn(
      [
        "bun",
        "run",
        "src/cli.ts",
        "analyze",
        "--input",
        "examples/sample-items.json",
        "--format",
        "json",
      ],
      {
        stderr: "pipe",
        stdout: "pipe",
      },
    )

    // When: the process exits.
    const stdout = await streamToText(process.stdout)
    const stderr = await streamToText(process.stderr)
    const exitCode = await process.exited

    // Then: stdout contains a parseable maintainer brief.
    expect(stderr).toBe("")
    expect(exitCode).toBe(0)
    const parsedJson: unknown = JSON.parse(stdout)
    const brief = MaintainerBriefSchema.parse(parsedJson)
    expect(brief.totalItems).toBe(4)
    expect(brief.tasks[0]?.lane).toBe("security_patch")
  })
})
