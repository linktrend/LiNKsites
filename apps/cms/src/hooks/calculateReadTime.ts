import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Calculate reading time from content
 * Assumes average reading speed of 200 words per minute
 */
function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return minutes
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isLexicalNode = (value: unknown): value is { text?: string; children?: unknown[] } =>
  isRecord(value)

const extractTextFromLexical = (content: unknown): string => {
  if (!isRecord(content) || !isRecord(content.root) || !Array.isArray(content.root.children)) {
    return ''
  }

  let text = ''

  const traverse = (node: unknown) => {
    if (!isLexicalNode(node)) return
    if (typeof node.text === 'string') {
      text += `${node.text} `
    }
    if (Array.isArray(node.children)) {
      node.children.forEach(traverse)
    }
  }

  content.root.children.forEach(traverse)
  return text
}

export const calculateReadTime: CollectionBeforeChangeHook = async ({
  data,
}: {
  data: Record<string, unknown>
}): Promise<Record<string, unknown>> => {
  // Skip if no content
  if (!data.content) {
    return data
  }

  let textContent = ''

  // Extract text based on content type
  if (typeof data.content === 'string') {
    textContent = data.content
  } else if (Array.isArray(data.content)) {
    // Handle blocks array
    data.content.forEach((block) => {
      if (isRecord(block) && block.richText) {
        textContent += `${extractTextFromLexical(block.richText)} `
      }
      if (isRecord(block) && block.content) {
        textContent += `${extractTextFromLexical(block.content)} `
      }
    })
  } else if (isRecord(data.content) && data.content.root) {
    // Handle Lexical content directly
    textContent = extractTextFromLexical(data.content)
  }

  // Calculate and set read time
  if (textContent) {
    data.readTime = calculateReadingTime(textContent)
  }

  return data
}
