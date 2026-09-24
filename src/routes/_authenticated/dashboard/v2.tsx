import { createFileRoute, Navigate } from '@tanstack/react-router'

/**
 * Deprecated: dashboard sudah disederhanakan jadi satu halaman.
 * Route ini dipertahankan sebagai redirect agar bookmark lama tetap berfungsi.
 */
export const Route = createFileRoute('/_authenticated/dashboard/v2')({
    component: DashboardV2Redirect,
})

function DashboardV2Redirect() {
    return <Navigate to='/dashboard' replace />
}
