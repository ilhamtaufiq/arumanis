import { createFileRoute } from '@tanstack/react-router'
import PostPekerjaanPage from '@/features/post-pekerjaan/components/PostPekerjaanPage'

export const Route = createFileRoute('/_authenticated/post-pekerjaan/')({
    component: PostPekerjaanPage,
})