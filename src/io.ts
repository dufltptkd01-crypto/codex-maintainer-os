import { readFile, writeFile } from "node:fs/promises"
import type { MaintainerItem } from "./schemas.js"
import { MaintainerItemsFileSchema } from "./schemas.js"

export async function readMaintainerItems(path: string): Promise<readonly MaintainerItem[]> {
  const text = await readFile(path, "utf8")
  const parsedJson: unknown = JSON.parse(text)

  return MaintainerItemsFileSchema.parse(parsedJson).items
}

export async function writeTextFile(path: string, text: string): Promise<void> {
  await writeFile(path, text, "utf8")
}
