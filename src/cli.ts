#!/usr/bin/env bun

import { Command } from "commander"
import { ZodError } from "zod"

import { assertNever } from "./assert.js"
import { resolveGitHubToken } from "./auth.js"
import { buildMaintainerBrief } from "./brief.js"
import { fetchGitHubItems } from "./github.js"
import { readMaintainerItems, writeTextFile } from "./io.js"
import { renderJsonBrief, renderMarkdownBrief } from "./report.js"
import type { AnalyzeOptions, MaintainerItem } from "./schemas.js"
import { AnalyzeOptionsSchema } from "./schemas.js"

async function loadItems(options: AnalyzeOptions): Promise<readonly MaintainerItem[]> {
  if (options.input !== undefined) {
    return await readMaintainerItems(options.input)
  }

  if (options.repo !== undefined) {
    const token = resolveGitHubToken(options, process.env)
    const fetchOptions =
      token === undefined ? { limit: options.limit } : { limit: options.limit, token }

    return await fetchGitHubItems(options.repo, fetchOptions)
  }

  return []
}

function renderBrief(options: AnalyzeOptions, items: readonly MaintainerItem[]): string {
  const briefOptions = options.repo === undefined ? {} : { repository: options.repo }
  const brief = buildMaintainerBrief(items, briefOptions)

  switch (options.format) {
    case "json":
      return renderJsonBrief(brief)
    case "markdown":
      return renderMarkdownBrief(brief)
    default:
      return assertNever(options.format)
  }
}

async function analyze(rawOptions: unknown): Promise<void> {
  const options = AnalyzeOptionsSchema.parse(rawOptions)
  const items = await loadItems(options)
  const output = renderBrief(options, items)

  if (options.output !== undefined) {
    await writeTextFile(options.output, output)
    return
  }

  process.stdout.write(output)
}

export async function runCli(argv: readonly string[]): Promise<void> {
  const program = new Command()

  program
    .name("cmo")
    .description("Codex Maintainer OS: turn GitHub maintenance work into a Codex task queue.")

  program
    .command("analyze")
    .description("Analyze GitHub issues and PRs from a file or repository.")
    .option("--format <format>", "Output format: markdown or json.", "markdown")
    .option("--input <path>", "Path to an offline maintainer-items JSON file.")
    .option("--limit <count>", "Maximum GitHub items to fetch.", "50")
    .option("--output <path>", "Write the report to a file instead of stdout.")
    .option("--repo <owner/name>", "GitHub repository to analyze.")
    .option("--token <token>", "GitHub token. Prefer GITHUB_TOKEN for regular use.")
    .action(analyze)

  await program.parseAsync([...argv], {
    from: "user",
  })
}

function printCliError(error: unknown): void {
  if (error instanceof ZodError) {
    process.stderr.write(`${error.issues.map((issue) => issue.message).join("\n")}\n`)
    return
  }

  if (error instanceof Error) {
    process.stderr.write(`${error.message}\n`)
    return
  }

  process.stderr.write("Unknown CLI failure.\n")
}

if (import.meta.main) {
  runCli(Bun.argv.slice(2)).catch((error: unknown) => {
    printCliError(error)
    process.exitCode = 1
  })
}
