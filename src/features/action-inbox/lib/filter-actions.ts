import type { ActionInboxItem } from '@/features/data-quality/types'

/**
 * Action inbox hanya menampilkan item dengan count > 0.
 * Paket pekerjaan status `canceled` / dibatalkan sudah di-exclude di API
 * (`DataQualityController` + scope `Pekerjaan::notCanceled`).
 *
 * Guard di FE: drop entry tanpa count / count 0 (mis. payload cache usang).
 */
export function filterActionInboxItems(actions: ActionInboxItem[] | null | undefined): ActionInboxItem[] {
    if (!actions?.length) return []
    return actions.filter((action) => Number(action.count) > 0)
}
