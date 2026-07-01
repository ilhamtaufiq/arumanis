import { normalizeRoleNames, normalizeRoleSlug } from '@/lib/pengawas-app'

const ADVANCED_MVP_ROLE_SLUGS = new Set(['admin', 'manager'])

export function canViewAdvancedMvpFeatures(roles: unknown): boolean {
    const slugs = normalizeRoleNames(roles).map(normalizeRoleSlug)
    return slugs.some((slug) => ADVANCED_MVP_ROLE_SLUGS.has(slug))
}