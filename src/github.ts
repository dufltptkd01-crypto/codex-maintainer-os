import ky from "ky"
import { z } from "zod"

import type { MaintainerItem, RepositoryFullName } from "./schemas.js"

const GitHubLabelSchema = z.union([
  z.string(),
  z.object({
    name: z.string().nullable(),
  }),
])

export const GitHubIssueSchema = z.object({
  body: z.string().nullable(),
  comments: z.number().int().min(0),
  created_at: z.string(),
  html_url: z.string().url(),
  labels: z.array(GitHubLabelSchema),
  number: z.number().int().positive(),
  pull_request: z.record(z.string(), z.unknown()).optional(),
  state: z.union([z.literal("open"), z.literal("closed")]),
  title: z.string().min(1),
  updated_at: z.string(),
  user: z
    .object({
      login: z.string(),
    })
    .nullable(),
})

const GitHubIssuesSchema = z.array(GitHubIssueSchema)

type GitHubIssue = z.infer<typeof GitHubIssueSchema>
type GitHubLabel = z.infer<typeof GitHubLabelSchema>

type FetchGitHubItemsOptions = {
  readonly limit: number
  readonly token?: string
}

function headersForToken(token: string | undefined): Record<string, string> {
  const baseHeaders = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  }

  if (token === undefined) {
    return baseHeaders
  }

  return {
    ...baseHeaders,
    Authorization: `Bearer ${token}`,
  }
}

function labelName(label: GitHubLabel): string | null {
  if (typeof label === "string") {
    return label
  }

  return label.name
}

export function toMaintainerItem(issue: GitHubIssue): MaintainerItem {
  return {
    author: issue.user?.login ?? null,
    body: issue.body,
    comments: issue.comments,
    createdAt: issue.created_at,
    htmlUrl: issue.html_url,
    itemType: issue.pull_request === undefined ? "issue" : "pull_request",
    labels: issue.labels.map(labelName).filter((label): label is string => label !== null),
    number: issue.number,
    state: issue.state,
    title: issue.title,
    updatedAt: issue.updated_at,
  }
}

export async function fetchGitHubItems(
  repository: RepositoryFullName,
  options: FetchGitHubItemsOptions,
): Promise<readonly MaintainerItem[]> {
  const client = ky.create({
    headers: headersForToken(options.token),
    prefixUrl: "https://api.github.com",
    retry: {
      limit: 2,
    },
    timeout: 20_000,
  })
  const response: unknown = await client
    .get(`repos/${repository}/issues`, {
      searchParams: {
        per_page: String(options.limit),
        state: "open",
      },
    })
    .json()
  const issues = GitHubIssuesSchema.parse(response)

  return issues.map(toMaintainerItem)
}
