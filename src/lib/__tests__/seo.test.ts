import { describe, expect, it } from 'vitest'
import { buildArticleJsonLd, buildOrganizationJsonLd } from '@/lib/seo'

describe('seo json-ld builders', () => {
    it('builds organization schema', () => {
        const schema = buildOrganizationJsonLd()
        expect(schema['@type']).toBe('GovernmentOrganization')
        expect(schema.name).toBe('Arumanis')
    })

    it('builds article schema with author', () => {
        const schema = buildArticleJsonLd({
            title: 'Judul Artikel',
            description: 'Ringkasan artikel.',
            url: 'https://arumanis.cianjur.space/publikasi/judul-artikel',
            image: 'https://arumanis.cianjur.space/cover.jpg',
            datePublished: '2026-01-01T00:00:00.000Z',
            authorName: 'Admin',
        })

        expect(schema['@type']).toBe('Article')
        expect(schema.headline).toBe('Judul Artikel')
        expect(schema.author).toEqual({ '@type': 'Person', name: 'Admin' })
    })
})