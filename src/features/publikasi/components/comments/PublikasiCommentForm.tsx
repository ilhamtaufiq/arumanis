import { useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CommentMarkdown } from './CommentMarkdown'
import { GiphyPicker } from './GiphyPicker'

type PublikasiCommentFormProps = {
    placeholder?: string
    initialBody?: string
    submitLabel?: string
    onSubmit: (body: string) => Promise<void>
    onSuccess?: () => void
    onCancel?: () => void
    autoFocus?: boolean
    allowGif?: boolean
}

export function PublikasiCommentForm({
    placeholder = 'Tulis komentar... (Markdown didukung)',
    initialBody = '',
    submitLabel = 'Kirim',
    onSubmit,
    onSuccess,
    onCancel,
    autoFocus,
    allowGif = true,
}: PublikasiCommentFormProps) {
    const [body, setBody] = useState(initialBody)
    const [submitting, setSubmitting] = useState(false)
    const [tab, setTab] = useState<'write' | 'preview'>('write')

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        const trimmed = body.trim()
        if (!trimmed) return

        try {
            setSubmitting(true)
            await onSubmit(trimmed)
            if (!initialBody) {
                setBody('')
                setTab('write')
            }
            onSuccess?.()
        } finally {
            setSubmitting(false)
        }
    }

    const appendGif = (markdown: string) => {
        setBody((current) => `${current}${markdown}`.trimStart())
        setTab('write')
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <Tabs value={tab} onValueChange={(value) => setTab(value as 'write' | 'preview')}>
                <TabsList className="h-8">
                    <TabsTrigger value="write" className="px-3 text-xs">
                        Tulis
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="px-3 text-xs">
                        Pratinjau
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="write" className="mt-2">
                    <Textarea
                        value={body}
                        onChange={(event) => setBody(event.target.value)}
                        placeholder={placeholder}
                        className="min-h-[96px] resize-y font-mono text-sm"
                        disabled={submitting}
                        autoFocus={autoFocus}
                    />
                </TabsContent>

                <TabsContent value="preview" className="mt-2">
                    <div className="min-h-[96px] rounded-md border border-border/70 bg-muted/20 p-3">
                        {body.trim() ? (
                            <CommentMarkdown content={body} />
                        ) : (
                            <p className="text-sm italic text-muted-foreground">
                                Pratinjau akan muncul di sini.
                            </p>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            <div className="flex flex-wrap items-center justify-between gap-2">
                {allowGif ? <GiphyPicker disabled={submitting} onSelect={appendGif} /> : <span />}
                <div className="flex items-center gap-2">
                    {onCancel ? (
                        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={submitting}>
                            Batal
                        </Button>
                    ) : null}
                    <Button type="submit" size="sm" disabled={submitting || !body.trim()}>
                        {submitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="mr-2 h-4 w-4" />
                        )}
                        {submitLabel}
                    </Button>
                </div>
            </div>
        </form>
    )
}