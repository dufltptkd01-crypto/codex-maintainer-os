import { compareTasks, minutesSavedForLane, taskFromItem } from "./lane.js"
import type {
  CodexLane,
  MaintainerBrief,
  MaintainerItem,
  Priority,
  RepositoryFullName,
} from "./schemas.js"

type BuildBriefOptions = {
  readonly generatedAt?: string
  readonly repository?: RepositoryFullName
}

type PriorityCounts = Record<Priority, number>
type LaneCounts = Record<CodexLane, number>

function countPriority(
  tasks: readonly { readonly priority: Priority }[],
  priority: Priority,
): number {
  return tasks.filter((task) => task.priority === priority).length
}

function countLane(tasks: readonly { readonly lane: CodexLane }[], lane: CodexLane): number {
  return tasks.filter((task) => task.lane === lane).length
}

function priorityCounts(tasks: readonly { readonly priority: Priority }[]): PriorityCounts {
  return {
    critical: countPriority(tasks, "critical"),
    high: countPriority(tasks, "high"),
    low: countPriority(tasks, "low"),
    medium: countPriority(tasks, "medium"),
  }
}

function laneCounts(tasks: readonly { readonly lane: CodexLane }[]): LaneCounts {
  return {
    docs_guardian: countLane(tasks, "docs_guardian"),
    issue_reproducer: countLane(tasks, "issue_reproducer"),
    pr_review: countLane(tasks, "pr_review"),
    release_guardian: countLane(tasks, "release_guardian"),
    security_patch: countLane(tasks, "security_patch"),
  }
}

export function buildMaintainerBrief(
  items: readonly MaintainerItem[],
  options: BuildBriefOptions = {},
): MaintainerBrief {
  const tasks = items.map(taskFromItem).toSorted(compareTasks)
  const estimatedMinutesSaved = tasks.reduce(
    (total, task) => total + minutesSavedForLane(task.lane),
    0,
  )
  const baseBrief = {
    estimatedMinutesSaved,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    laneCounts: laneCounts(tasks),
    priorityCounts: priorityCounts(tasks),
    tasks,
    totalItems: items.length,
  }

  if (options.repository !== undefined) {
    return {
      ...baseBrief,
      repository: options.repository,
    }
  }

  return baseBrief
}
