import { createFileRoute } from '@tanstack/react-router'
import { ForbiddenPage } from '@/components/errors/error-page'

export const Route = createFileRoute('/forbidden')({
    component: ForbiddenPage,
})