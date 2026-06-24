import { useEffect, useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'
import { sanitizePublicationHtml, setupPublicationMedia } from '../lib/publication-media'

type PublikasiContentProps = {
    html: string
    className?: string
}

export function PublikasiContent({ html, className }: PublikasiContentProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    const sanitizedHtml = useMemo(() => sanitizePublicationHtml(html), [html])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        return setupPublicationMedia(container)
    }, [sanitizedHtml])

    return (
        <div
            ref={containerRef}
            className={cn('publication-content', className)}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    )
}