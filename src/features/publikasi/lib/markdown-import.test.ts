import { describe, expect, it } from 'vitest'
import { applyMarkdownImport, parseMarkdownFrontMatter } from './markdown-import'

describe('markdown-import', () => {
  it('parses front matter and returns markdown body for TipTap', () => {
    const raw = `---
title: Judul Test
category: Berita
cover_image: https://example.com/cover.jpg
---

# Judul Test

Paragraf **tebal** dan [tautan](https://example.com).
`

    const parsed = parseMarkdownFrontMatter(raw)
    expect(parsed.frontMatter.title).toBe('Judul Test')
    expect(parsed.frontMatter.category).toBe('Berita')
    expect(parsed.body).toContain('# Judul Test')

    const result = applyMarkdownImport(raw)
    expect(result.metadata.title).toBe('Judul Test')
    expect(result.metadata.category).toBe('Berita')
    expect(result.metadata.coverImage).toBe('https://example.com/cover.jpg')
    expect(result.markdown).toContain('**tebal**')
    expect(result.markdown).toContain('[tautan](https://example.com)')
  })

  it('extracts title from first heading when front matter is missing', () => {
    const result = applyMarkdownImport('# Halo Dunia\n\nKonten.')
    expect(result.metadata.title).toBe('Halo Dunia')
    expect(result.markdown).toContain('# Halo Dunia')
  })
})