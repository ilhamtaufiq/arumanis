export type MarkdownFrontMatter = {
  title?: string
  description?: string
  category?: string
  cover_image?: string
  tags?: string[]
}

export type ParsedMarkdown = {
  frontMatter: MarkdownFrontMatter
  body: string
}

export type MarkdownImportMetadata = {
  title?: string
  category?: string
  coverImage?: string
}

export type MarkdownImportResult = {
  markdown: string
  metadata: MarkdownImportMetadata
}

const CATEGORY_OPTIONS = new Set([
  'Berita',
  'Galeri',
  'Informasi Publik',
  'Dokumentasi',
])

function parseYamlValue(value: string): string | string[] {
  const trimmed = value.trim()
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean)
  }
  return trimmed.replace(/^["']|["']$/g, '')
}

export function parseMarkdownFrontMatter(raw: string): ParsedMarkdown {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) {
    return { frontMatter: {}, body: raw.trim() }
  }

  const frontMatter: MarkdownFrontMatter = {}
  const lines = match[1].split(/\r?\n/)

  for (const line of lines) {
    const separator = line.indexOf(':')
    if (separator === -1) continue

    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim()
    if (!key || !value) continue

    if (key === 'title' || key === 'description' || key === 'category' || key === 'cover_image') {
      frontMatter[key] = parseYamlValue(value) as string
      continue
    }

    if (key === 'tags') {
      const parsed = parseYamlValue(value)
      frontMatter.tags = Array.isArray(parsed) ? parsed : [parsed]
    }
  }

  return {
    frontMatter,
    body: match[2].trim(),
  }
}

export function extractTitleFromMarkdown(body: string): string | undefined {
  const match = body.match(/^#\s+(.+)$/m)
  return match?.[1]?.trim()
}

export function applyMarkdownImport(raw: string): MarkdownImportResult {
  const { frontMatter, body } = parseMarkdownFrontMatter(raw)

  const title = frontMatter.title || extractTitleFromMarkdown(body)
  const category =
    frontMatter.category && CATEGORY_OPTIONS.has(frontMatter.category)
      ? frontMatter.category
      : undefined

  return {
    markdown: body,
    metadata: {
      title,
      category,
      coverImage: frontMatter.cover_image,
    },
  }
}