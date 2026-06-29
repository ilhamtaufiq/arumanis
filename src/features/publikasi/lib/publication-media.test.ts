import { describe, expect, it } from 'vitest'
import {
    extractYoutubeId,
    isPublicationDownloadLink,
    sanitizePublicationHtml,
} from './publication-media'

describe('publication-media', () => {
  it('extracts youtube id from common urls', () => {
    expect(extractYoutubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(extractYoutubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('preserves TipTap highlight marks with css variables', () => {
    const html =
      '<p>Hello <mark data-color="var(--tt-color-highlight-yellow)" style="background-color: var(--tt-color-highlight-yellow); color: inherit">world</mark></p>'

    const sanitized = sanitizePublicationHtml(html)

    expect(sanitized).toContain('<mark')
    expect(sanitized).toContain('data-color="var(--tt-color-highlight-yellow)"')
    expect(sanitized).toContain('background-color: var(--tt-color-highlight-yellow)')
  })

  it('preserves task list structure and checked state', () => {
    const html = `<ul data-type="taskList">
<li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Done</p></div></li>
<li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Todo</p></div></li>
</ul>`

    const sanitized = sanitizePublicationHtml(html)

    expect(sanitized).toContain('data-type="taskList"')
    expect(sanitized).toContain('data-checked="true"')
    expect(sanitized).toMatch(/disabled/)
    expect(sanitized).toMatch(/checked/)
  })

  it('preserves text alignment and semantic marks', () => {
    const html =
      '<p style="text-align: center">Center</p><p><u>underline</u> <s>strike</s> <sub>sub</sub> <sup>sup</sup></p>'

    const sanitized = sanitizePublicationHtml(html)

    expect(sanitized).toContain('text-align: center')
    expect(sanitized).toContain('<u>underline</u>')
    expect(sanitized).toContain('<s>strike</s>')
    expect(sanitized).toContain('<sub>sub</sub>')
    expect(sanitized).toContain('<sup>sup</sup>')
  })

  it('preserves uploaded video poster attribute', () => {
    const html =
      '<video class="publication-video" src="https://example.com/video.mp4" poster="https://example.com/poster.jpg" controls preload="metadata"></video>'

    const sanitized = sanitizePublicationHtml(html)

    expect(sanitized).toContain('poster="https://example.com/poster.jpg"')
    expect(sanitized).toContain('preload="none"')
  })

  it('replaces youtube iframe with click-to-play placeholder', () => {
    const html =
      '<div class="iframe-wrapper"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen="true"></iframe></div>'

    const sanitized = sanitizePublicationHtml(html)

    expect(sanitized).toContain('publication-video-placeholder')
    expect(sanitized).toContain('data-embed-type="youtube"')
    expect(sanitized).not.toContain('<iframe')
  })

  it('detects publication download links', () => {
    const pdfLink = document.createElement('a')
    pdfLink.href = 'https://example.com/lampiran.pdf'
    expect(isPublicationDownloadLink(pdfLink)).toBe(true)

    const downloadLink = document.createElement('a')
    downloadLink.href = 'https://example.com/file'
    downloadLink.setAttribute('download', '')
    expect(isPublicationDownloadLink(downloadLink)).toBe(true)

    const regularLink = document.createElement('a')
    regularLink.href = 'https://example.com/artikel'
    expect(isPublicationDownloadLink(regularLink)).toBe(false)
  })
})