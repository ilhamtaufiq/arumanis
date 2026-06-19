import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import type { Components } from 'react-markdown'

function slugifyText(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
}

const components: Components = {
    img: ({ src, alt, ...props }) => (
        <img
            src={
                typeof src === 'string' && src.startsWith('http')
                    ? src
                    : `/docs/user-guide/${(src ?? '').replace(/^\.\//, '')}`
            }
            alt={alt ?? ''}
            className="rounded-md max-w-full"
            {...props}
        />
    ),
    a: ({ href, children, ...props }) => {
        const isInternalMd =
            typeof href === 'string' &&
            href.endsWith('.md') &&
            !href.startsWith('http')
        const resolvedHref = isInternalMd
            ? `/panduan/${href
                  .replace(/\.md$/, '')
                  .replace(/^\d+[-_]/, '')
                  .toLowerCase()}`
            : href
        return (
            <a
                href={resolvedHref}
                className={cn(
                    'font-medium underline underline-offset-4 decoration-primary/40 hover:decoration-primary',
                    props.className,
                )}
                {...props}
            >
                {children}
            </a>
        )
    },
    h1: ({ children, ...props }) => {
        const id = slugifyText(String(children ?? ''))
        return (
            <h1
                id={id}
                className="scroll-m-20 text-3xl font-bold tracking-tight mb-4"
                {...props}
            >
                {children}
            </h1>
        )
    },
    h2: ({ children, ...props }) => {
        const id = slugifyText(String(children ?? ''))
        return (
            <h2
                id={id}
                className="scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-3"
                {...props}
            >
                {children}
            </h2>
        )
    },
    h3: ({ children, ...props }) => {
        const id = slugifyText(String(children ?? ''))
        return (
            <h3
                id={id}
                className="scroll-m-20 text-xl font-semibold tracking-tight mt-6 mb-2"
                {...props}
            >
                {children}
            </h3>
        )
    },
    p: ({ children, ...props }) => (
        <p className="leading-7 mb-4" {...props}>
            {children}
        </p>
    ),
    ul: ({ children, ...props }) => (
        <ul className="list-disc pl-6 mb-4 space-y-1" {...props}>
            {children}
        </ul>
    ),
    ol: ({ children, ...props }) => (
        <ol className="list-decimal pl-6 mb-4 space-y-1" {...props}>
            {children}
        </ol>
    ),
    li: ({ children, ...props }) => (
        <li className="leading-7" {...props}>
            {children}
        </li>
    ),
    code: ({ className, children, ...props }) => {
        const isInline = !className
        if (isInline) {
            return (
                <code
                    className="bg-muted rounded px-1.5 py-0.5 text-sm font-mono"
                    {...props}
                >
                    {children}
                </code>
            )
        }
        return (
            <pre className="bg-muted rounded-lg p-4 mb-4 overflow-x-auto">
                <code
                    className={cn('text-sm font-mono', className)}
                    {...props}
                >
                    {children}
                </code>
            </pre>
        )
    },
    table: ({ children, ...props }) => (
        <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse text-sm" {...props}>
                {children}
            </table>
        </div>
    ),
    th: ({ children, ...props }) => (
        <th
            className="border border-border bg-muted/50 px-3 py-2 text-left font-medium"
            {...props}
        >
            {children}
        </th>
    ),
    td: ({ children, ...props }) => (
        <td className="border border-border px-3 py-2" {...props}>
            {children}
        </td>
    ),
    hr: () => <hr className="my-6 border-border" />,
    blockquote: ({ children, ...props }) => (
        <blockquote
            className="border-l-4 border-primary/20 pl-4 italic mb-4"
            {...props}
        >
            {children}
        </blockquote>
    ),
}

interface PanduanMarkdownProps {
    content: string
    className?: string
}

export function PanduanMarkdown({ content, className }: PanduanMarkdownProps) {
    return (
        <ReactMarkdown
            className={cn('max-w-none', className)}
            remarkPlugins={[remarkGfm]}
            components={components}
        >
            {content}
        </ReactMarkdown>
    )
}
