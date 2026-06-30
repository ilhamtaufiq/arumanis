import { useEffect, useMemo } from 'react'
import { applyPageMeta, type PageMeta } from '@/lib/seo'

export function usePageSeo(meta: PageMeta | null | undefined) {
    const metaKey = useMemo(
        () =>
            meta
                ? JSON.stringify({
                      title: meta.title,
                      description: meta.description,
                      image: meta.image,
                      url: meta.url,
                      type: meta.type,
                      robots: meta.robots,
                      jsonLd: meta.jsonLd,
                  })
                : '',
        [meta],
    )

    useEffect(() => {
        if (!metaKey) return
        const parsed = JSON.parse(metaKey) as PageMeta
        return applyPageMeta(parsed)
    }, [metaKey])
}