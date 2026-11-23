import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireAuthenticatedSession } from '@/lib/route-auth'
import { MobileShell } from '@/features/mobile/components/MobileShell'

/** Area mobile (Capacitor dan browser ponsel): sesi sama dengan area terautentikasi, tanpa sidebar. */
export const Route = createFileRoute('/m')({
    beforeLoad: async () => {
        await requireAuthenticatedSession()
    },
    component: () => (
        <MobileShell>
            <Outlet />
        </MobileShell>
    ),
})
