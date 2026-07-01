import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { RouteSuspense } from '@/components/route-suspense'
import { lazyImport } from '@/lib/utils'

const ChatPage = lazy(() =>
    lazyImport(() => import('@/features/chat/components/chat-page'), 'chat-page'),
)

function ChatRoute() {
    return (
        <RouteSuspense label="Memuat Asisten AI...">
            <ChatPage />
        </RouteSuspense>
    )
}

export const Route = createFileRoute('/_authenticated/chat/')({
    component: ChatRoute,
})