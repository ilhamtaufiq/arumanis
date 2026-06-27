import { useEffect, useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'
import { PUBLICATION_READER_CLASSES } from '../lib/publication-content-classes'
import { sanitizePublicationHtml, setupPublicationMedia } from '../lib/publication-media'

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
      className={cn(PUBLICATION_READER_CLASSES, className)}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}