import { createFileRoute } from '@tanstack/react-router'
import KanbanPage from '@/features/kanban/components/KanbanPage'

export const Route = createFileRoute('/_authenticated/kanban/')({
    component: KanbanPage,
})