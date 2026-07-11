import { createFileRoute, redirect } from '@tanstack/react-router'
import { MaintenancePage } from '@/components/maintenance/MaintenancePage'
import { shouldBlockForMaintenance } from '@/lib/maintenance-session'

export const Route = createFileRoute('/maintenance')({
    beforeLoad: async () => {
        // If maintenance is off (or user is bypass), leave this page.
        if (!(await shouldBlockForMaintenance('/'))) {
            throw redirect({ to: '/' })
        }
    },
    component: MaintenancePage,
})
