import { describe, expect, it } from 'vitest'
import { applyMarkdownImport, parseMarkdownFrontMatter } from './markdown-import'

describe('markdown-import', () => {
  it('parses front matter and converts body to html', () => {
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
    expect(result.title).toBe('Judul Test')
    expect(result.category).toBe('Berita')
    expect(result.coverImage).toBe('https://example.com/cover.jpg')
    expect(result.html).toContain('<strong>tebal</strong>')
    expect(result.html).toContain('<a href="https://example.com">')
  })

  it('extracts title from first heading when front matter is missing', () => {
    const result = applyMarkdownImport('# Halo Dunia\n\nKonten.')
    expect(result.title).toBe('Halo Dunia')
    expect(result.html).toContain('<h1>')
  })
})