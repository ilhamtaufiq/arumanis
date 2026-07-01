import { useEffect, useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'
import { PUBLICATION_READER_CLASSES } from '../lib/publication-content-classes'
import { trackVisitorEvent } from '@/lib/analytics/visitor-events'
import {
    sanitizePublicationHtml,
    setupPublicationDownloadTracking,
    setupPublicationMedia,
} from '../lib/publication-media'

import '@/components/tiptap-node/blockquote-node/blockquote-node.scss'
import '@/components/tiptap-node/code-block-node/code-block-node.scss'
import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss'
import '@/components/tiptap-node/list-node/list-node.scss'
import '@/components/tiptap-node/image-node/image-node.scss'
import '@/components/tiptap-node/heading-node/heading-node.scss'
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss'
import './publication-reader.scss'

type PublikasiContentProps = {
  html: string
  className?: string
  publicationSlug?: string
}

export function PublikasiContent({ html, className, publicationSlug }: PublikasiContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const sanitizedHtml = useMemo(() => sanitizePublicationHtml(html), [html])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const cleanupMedia = setupPublicationMedia(container)
    const cleanupDownloads = setupPublicationDownloadTracking(container, ({ href, label }) => {
      void trackVisitorEvent('publication_download', {
        slug: publicationSlug ?? 'unknown',
        href,
        label,
      })
    })

    return () => {
      cleanupMedia()
      cleanupDownloads()
    }
  }, [publicationSlug, sanitizedHtml])

  return (
    <div
      ref={containerRef}
      className={cn(PUBLICATION_READER_CLASSES, className)}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}