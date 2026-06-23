import { createFileRoute } from '@tanstack/react-router'
import { NotFoundPage } from '@/components/errors/error-page'

export const Route = createFileRoute('/$')({
    component: NotFoundPage,
})