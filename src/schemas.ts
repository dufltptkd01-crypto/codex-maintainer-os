import { z } from "zod"

export const CODEX_LANES = [
  "security_patch",
  "release_guardian",
  "pr_review",
  "issue_reproducer",
  "docs_guardian",
] as const

export const ITEM_TYPES = ["issue", "pull_request"] as const
export const PRIORITIES = ["critical", "high", "medium", "low"] as const
export const REPORT_FORMATS = ["markdown", "json"] as const

export const RepositoryFullNameSchema = z
  .string()
  .regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/)
  .brand("RepositoryFullName")

export const MaintainerItemSchema = z.object({
  author: z.string().nullable().default(null),
  body: z.string().nullable().default(null),
  comments: z.number().int().min(0).default(0),
  createdAt: z.string().datetime().optional(),
  htmlUrl: z.string().url().optional(),
  itemType: z.enum(ITEM_TYPES).default("issue"),
  labels: z.array(z.string()).default([]),
  number: z.number().int().positive(),
  state: z.union([z.literal("open"), z.literal("closed")]).default("open"),
  title: z.string().min(1),
  updatedAt: z.string().datetime().optional(),
})

export const MaintainerItemsFileSchema = z.object({
  items: z.array(MaintainerItemSchema),
})

export const AnalyzeOptionsSchema = z
  .object({
    format: z.enum(REPORT_FORMATS).default("markdown"),
    input: z.string().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    output: z.string().min(1).optional(),
    repo: RepositoryFullNameSchema.optional(),
    token: z.string().min(1).optional(),
  })
  .refine((value) => value.input !== undefined || value.repo !== undefined, {
    message: "Provide --input for offline analysis or --repo owner/name for GitHub analysis.",
  })

export const PriorityCountsSchema = z.object({
  critical: z.number().int().min(0),
  high: z.number().int().min(0),
  low: z.number().int().min(0),
  medium: z.number().int().min(0),
})

export const LaneCountsSchema = z.object({
  docs_guardian: z.number().int().min(0),
  issue_reproducer: z.number().int().min(0),
  pr_review: z.number().int().min(0),
  release_guardian: z.number().int().min(0),
  security_patch: z.number().int().min(0),
})

export const CodexTaskSchema = z.object({
  codexCommand: z.string().min(1),
  instruction: z.string().min(1),
  item: MaintainerItemSchema,
  lane: z.enum(CODEX_LANES),
  priority: z.enum(PRIORITIES),
  reason: z.string().min(1),
  suggestedLabels: z.array(z.string()),
  taskId: z.string().min(1),
  title: z.string().min(1),
})

export const MaintainerBriefSchema = z.object({
  estimatedMinutesSaved: z.number().int().min(0),
  generatedAt: z.string().datetime(),
  laneCounts: LaneCountsSchema,
  priorityCounts: PriorityCountsSchema,
  repository: RepositoryFullNameSchema.optional(),
  tasks: z.array(CodexTaskSchema),
  totalItems: z.number().int().min(0),
})

export type AnalyzeOptions = z.infer<typeof AnalyzeOptionsSchema>
export type CodexLane = (typeof CODEX_LANES)[number]
export type CodexTask = z.infer<typeof CodexTaskSchema>
export type MaintainerBrief = z.infer<typeof MaintainerBriefSchema>
export type MaintainerItem = z.infer<typeof MaintainerItemSchema>
export type Priority = (typeof PRIORITIES)[number]
export type RepositoryFullName = z.infer<typeof RepositoryFullNameSchema>
export type ReportFormat = (typeof REPORT_FORMATS)[number]
