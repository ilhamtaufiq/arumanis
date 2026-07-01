import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { PublikasiCommentManagement } from '@/features/publikasi/components/PublikasiCommentManagement'

const komentarSearchSchema = z.object({
    blog_id: z.coerce.number().optional(),
})

export const Route = createFileRoute('/_authenticated/manajemen-publikasi/komentar')({
    validateSearch: (search) => komentarSearchSchema.parse(search),
    component: KomentarPublikasiPage,
})

function KomentarPublikasiPage() {
    const { blog_id: blogId } = Route.useSearch()

    return <PublikasiCommentManagement initialBlogId={blogId} />
}