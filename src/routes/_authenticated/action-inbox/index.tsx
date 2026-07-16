import { createFileRoute } from '@tanstack/react-router'
import ActionInboxPage from '@/features/action-inbox/components/ActionInboxPage'

export const Route = createFileRoute('/_authenticated/action-inbox/')({
    component: ActionInboxPage,
})
