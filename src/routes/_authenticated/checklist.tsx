import { createFileRoute } from '@tanstack/react-router'
import ChecklistPage from '@/features/checklist/components/ChecklistPage'

export const Route = createFileRoute('/_authenticated/checklist')({
    component: ChecklistPage,
})
