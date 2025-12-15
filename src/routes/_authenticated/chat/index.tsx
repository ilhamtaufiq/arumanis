import { createFileRoute } from '@tanstack/react-router'
import { Chat } from '@/features/chat/components/Chat'

export const Route = createFileRoute('/_authenticated/chat/')({
    component: Chat,
})
