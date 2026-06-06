import { assertNever } from "./assert.js"
import type { CodexLane, MaintainerBrief, Priority } from "./schemas.js"

const PRIORITY_ORDER = ["critical", "high", "medium", "low"] as const
const LANE_ORDER = [
  "security_patch",
  "release_guardian",
  "pr_review",
  "issue_reproducer",
  "docs_guardian",
] as const

function priorityLabel(priority: Priority): string {
  switch (priority) {
    case "critical":
      return "Critical"
    case "high":
      return "High"
    case "medium":
      return "Medium"
    case "low":
      return "Low"
    default:
      return assertNever(priority)
  }
}

function laneLabel(lane: CodexLane): string {
  switch (lane) {
    case "security_patch":
      return "Security Patch"
    case "release_guardian":
      return "Release Guardian"
    case "pr_review":
      return "PR Review"
    case "issue_reproducer":
      return "Issue Reproducer"
    case "docs_guardian":
      return "Docs Guardian"
    default:
      return assertNever(lane)
  }
}

function escapeCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ")
}

function renderPriorityTable(brief: MaintainerBrief): string {
  const rows = PRIORITY_ORDER.map(
    (priority) => `| ${priority} | ${brief.priorityCounts[priority]} |`,
  )

  return ["| Priority | Count |", "| --- | ---: |", ...rows].join("\n")
}

function renderLaneTable(brief: MaintainerBrief): string {
  const rows = LANE_ORDER.map((lane) => `| ${lane} | ${brief.laneCounts[lane]} |`)

  return ["| Lane | Count |", "| --- | ---: |", ...rows].join("\n")
}

function renderTaskTable(brief: MaintainerBrief): string {
  const rows = brief.tasks.map(
    (task) =>
      `| ${[
        `#${task.item.number}`,
        priorityLabel(task.priority),
        laneLabel(task.lane),
        escapeCell(task.title),
        `\`${task.codexCommand}\``,
      ].join(" | ")} |`,
  )

  return [
    "| Item | Priority | Lane | Title | Command |",
    "| --- | --- | --- | --- | --- |",
    ...rows,
  ].join("\n")
}

function renderTaskPrompts(brief: MaintainerBrief): string {
  return brief.tasks
    .map((task) =>
      [
        `### ${task.codexCommand}`,
        "",
        `- Source: ${task.item.htmlUrl ?? `#${task.item.number}`}`,
        `- Reason: ${task.reason}`,
        `- Labels: ${task.suggestedLabels.join(", ")}`,
        "",
        task.instruction,
      ].join("\n"),
    )
    .join("\n\n")
}

export function renderJsonBrief(brief: MaintainerBrief): string {
  return `${JSON.stringify(brief, null, 2)}\n`
}

export function renderMarkdownBrief(brief: MaintainerBrief): string {
  const repositoryLine =
    brief.repository === undefined ? "" : `\nRepository: \`${brief.repository}\`\n`

  return [
    "# Codex Maintainer OS Brief",
    repositoryLine,
    `Generated: ${brief.generatedAt}`,
    `Items analyzed: ${brief.totalItems}`,
    `Estimated maintainer time saved: ${brief.estimatedMinutesSaved} minutes`,
    "",
    "## Priority Mix",
    "",
    renderPriorityTable(brief),
    "",
    "## Codex Lanes",
    "",
    renderLaneTable(brief),
    "",
    "## Codex Task Queue",
    "",
    renderTaskTable(brief),
    "",
    "## Task Prompts",
    "",
    renderTaskPrompts(brief),
    "",
  ].join("\n")
}
