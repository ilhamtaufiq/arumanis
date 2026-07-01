import { createFileRoute } from '@tanstack/react-router'
import { ChangelogPage } from '@/features/public/changelog-page'

export const Route = createFileRoute('/changelog')({
    component: ChangelogPage,
})