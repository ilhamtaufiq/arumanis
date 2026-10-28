import { describe, expect, it } from 'bun:test'
import { buildMetaTags } from './seo-meta.ts'

const meta = {
  title: 'Judul',
  description: 'Deskripsi',
  image: 'https://arumanis.cianjur.space/cover.jpg',
  url: 'https://arumanis.cianjur.space/',
}

describe('buildMetaTags twitter', () => {
  it('memakai atribut name agar dibaca crawler X', () => {
    const tags = buildMetaTags(meta)

    expect(tags).toContain('<meta name="twitter:card"')
    expect(tags).toContain('<meta name="twitter:title" content="Judul"')
    expect(tags).not.toContain('property="twitter:')
  })

  it('mencantumkan akun @arumanis_space sebagai twitter:site dan twitter:creator', () => {
    const tags = buildMetaTags(meta)

    expect(tags).toContain('<meta name="twitter:site" content="@arumanis_space"')
    expect(tags).toContain('<meta name="twitter:creator" content="@arumanis_space"')
  })
})
