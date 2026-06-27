import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { isAllowedCommentImageUrl, isAllowedCommentLinkUrl } from '../../lib/comment-markdown'

type CommentMarkdownProps = {
    content: string
    className?: string
}

export function CommentMarkdown({ content, className }: CommentMarkdownProps) {
    return (
        <div
            className={cn(
                'prose prose-sm prose-slate dark:prose-invert max-w-none break-words',
                className,
            )}
        >
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                img: ({ src, alt }) => {
                    if (!src || !isAllowedCommentImageUrl(src)) return null
                    return (
                        <img
                            src={src}
                            alt={alt ?? 'GIF'}
                            loading="lazy"
                            className="my-2 max-h-48 rounded-lg border border-border/60"
                        />
                    )
                },
                a: ({ href, children }) => {
                    if (!href || !isAllowedCommentLinkUrl(href)) {
                        return <span>{children}</span>
                    }
                    return (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary underline underline-offset-2"
                        >
                            {children}
                        </a>
                    )
                },
                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
            }}
        >
            {content}
        </ReactMarkdown>
        </div>
    )
}