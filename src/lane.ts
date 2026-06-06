import { assertNever } from "./assert.js"
import type { CodexLane, CodexTask, MaintainerItem, Priority } from "./schemas.js"

type Signal = {
  readonly lane: CodexLane
  readonly priority: Priority
  readonly reason: string
  readonly suggestedLabels: readonly string[]
}

const SECURITY_TERMS = ["security", "vulnerability", "cve", "token", "secret", "leak"] as const
const RELEASE_TERMS = ["regression", "release-blocker", "blocker", "breaks", "fails"] as const
const DOCS_TERMS = ["docs", "documentation", "readme", "quickstart", "example"] as const
const TEST_TERMS = ["flaky", "test", "repro", "reproduce"] as const

const PRIORITY_RANK: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

const LANE_SLUGS: Record<CodexLane, string> = {
  docs_guardian: "docs-guardian",
  issue_reproducer: "issue-reproducer",
  pr_review: "pr-review",
  release_guardian: "release-guardian",
  security_patch: "security-patch",
}

function normalizedText(item: MaintainerItem): string {
  return [item.title, item.body ?? "", ...item.labels].join(" ").toLowerCase()
}

function hasAnyTerm(text: string, terms: readonly string[]): boolean {
  return terms.some((term) => text.includes(term))
}

function signalForIssue(text: string): Signal {
  if (hasAnyTerm(text, SECURITY_TERMS)) {
    return {
      lane: "security_patch",
      priority: "critical",
      reason: "Possible security impact requires verified reproduction and minimal patch.",
      suggestedLabels: ["codex:security", "needs-verification"],
    }
  }

  if (hasAnyTerm(text, RELEASE_TERMS)) {
    return {
      lane: "release_guardian",
      priority: "high",
      reason: "Release or regression signal should be checked before the next cut.",
      suggestedLabels: ["codex:release", "needs-regression-test"],
    }
  }

  if (hasAnyTerm(text, DOCS_TERMS)) {
    return {
      lane: "docs_guardian",
      priority: "low",
      reason: "Documentation drift can be fixed with example verification.",
      suggestedLabels: ["codex:docs", "good-first-codex-task"],
    }
  }

  if (hasAnyTerm(text, TEST_TERMS)) {
    return {
      lane: "issue_reproducer",
      priority: "medium",
      reason: "The issue is ready for a focused failing test or reproducer.",
      suggestedLabels: ["codex:reproducer", "needs-test"],
    }
  }

  return {
    lane: "issue_reproducer",
    priority: "medium",
    reason: "The issue needs triage into a failing test before implementation.",
    suggestedLabels: ["codex:triage", "needs-reproducer"],
  }
}

function signalForPullRequest(text: string): Signal {
  if (hasAnyTerm(text, SECURITY_TERMS)) {
    return {
      lane: "security_patch",
      priority: "critical",
      reason: "Security-sensitive PRs need exploitability and regression review.",
      suggestedLabels: ["codex:security-review", "needs-maintainer-review"],
    }
  }

  if (hasAnyTerm(text, RELEASE_TERMS)) {
    return {
      lane: "release_guardian",
      priority: "high",
      reason: "Release-sensitive PRs need compatibility and changelog checks.",
      suggestedLabels: ["codex:release-review", "needs-compat-check"],
    }
  }

  return {
    lane: "pr_review",
    priority: "medium",
    reason: "Open PR should receive compatibility, test, and docs review.",
    suggestedLabels: ["codex:review", "needs-review"],
  }
}

function signalForItem(item: MaintainerItem): Signal {
  const text = normalizedText(item)

  switch (item.itemType) {
    case "issue":
      return signalForIssue(text)
    case "pull_request":
      return signalForPullRequest(text)
    default:
      return assertNever(item.itemType)
  }
}

function taskInstruction(item: MaintainerItem, signal: Signal): string {
  switch (signal.lane) {
    case "security_patch":
      return `Verify the security impact for #${item.number}, add a focused regression test, propose the smallest safe patch, and document residual risk.`
    case "release_guardian":
      return `Reproduce #${item.number} against the release branch, identify the breaking surface, add a compatibility test, and draft release-note language.`
    case "pr_review":
      return `Review PR #${item.number} for behavioral regressions, missing tests, compatibility risks, and maintainer follow-up comments.`
    case "issue_reproducer":
      return `Turn issue #${item.number} into a failing test or minimal reproduction before proposing a code change.`
    case "docs_guardian":
      return `Verify the documentation claim in #${item.number}, update the stale example, and add a doc check when possible.`
    default:
      return assertNever(signal.lane)
  }
}

export function minutesSavedForLane(lane: CodexLane): number {
  switch (lane) {
    case "security_patch":
      return 120
    case "release_guardian":
      return 90
    case "pr_review":
      return 55
    case "issue_reproducer":
      return 45
    case "docs_guardian":
      return 55
    default:
      return assertNever(lane)
  }
}

export function taskFromItem(item: MaintainerItem): CodexTask {
  const signal = signalForItem(item)
  const taskId = `${item.itemType === "issue" ? "issue" : "pr"}-${item.number}-${LANE_SLUGS[signal.lane]}`

  return {
    codexCommand: `codex task ${taskId}`,
    instruction: taskInstruction(item, signal),
    item,
    lane: signal.lane,
    priority: signal.priority,
    reason: signal.reason,
    suggestedLabels: [...signal.suggestedLabels],
    taskId,
    title: item.title,
  }
}

export function compareTasks(left: CodexTask, right: CodexTask): number {
  const priorityDifference = PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority]

  if (priorityDifference !== 0) {
    return priorityDifference
  }

  return left.item.number - right.item.number
}
