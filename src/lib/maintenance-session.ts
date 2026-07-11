import { getMaintenanceStatus } from '@/features/settings/api'
import {
    isMaintenanceBypassEmail,
    isMaintenanceExemptPath,
    type MaintenanceStatus,
} from '@/features/settings/lib/maintenance'
import { fetchSession } from '@/lib/auth-session'

const CACHE_MS = 15_000

let cached: { status: MaintenanceStatus; at: number } | null = null
let inflight: Promise<MaintenanceStatus> | null = null

export function invalidateMaintenanceCache(): void {
    cached = null
    inflight = null
}

export async function fetchMaintenanceStatus(force = false): Promise<MaintenanceStatus> {
    if (!force && cached && Date.now() - cached.at < CACHE_MS) {
        return cached.status
    }

    if (!force && inflight) {
        return inflight
    }

    inflight = getMaintenanceStatus()
        .then((status) => {
            cached = { status, at: Date.now() }
            return status
        })
        .catch(() => {
            // Fail open — do not lock the app on network errors
            const fallback: MaintenanceStatus = {
                enabled: false,
                bypass: false,
                can_access: true,
                message: null,
            }
            cached = { status: fallback, at: Date.now() }
            return fallback
        })
        .finally(() => {
            inflight = null
        })

    return inflight
}

/**
 * Whether the current visitor should be blocked by maintenance mode.
 * Runs session + maintenance status in parallel for beforeLoad gates.
 */
export async function shouldBlockForMaintenance(pathname: string): Promise<boolean> {
    if (isMaintenanceExemptPath(pathname)) {
        return false
    }

    const [status, session] = await Promise.all([
        fetchMaintenanceStatus(),
        fetchSession(),
    ])

    if (!status.enabled) {
        return false
    }

    if (status.can_access || status.bypass) {
        return false
    }

    if (isMaintenanceBypassEmail(session?.user?.email)) {
        return false
    }

    return true
}
