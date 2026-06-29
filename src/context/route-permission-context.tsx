import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRoutePermissionRules } from '@/features/route-permissions/hooks/useRoutePermissions'
import type { RoutePermissionRule } from '@/features/route-permissions/types'
import { useAuthStore } from '@/stores/auth-stores'
import { fetchSession } from '@/lib/auth-session'
import { defineAbilityForRules, AppAbility } from '@/config/ability'
import { AbilityContext } from './AbilityContext'

interface RoutePermissionContextType {
    rules: RoutePermissionRule[]
    isLoading: boolean
    ability: AppAbility
    refreshRules: () => Promise<void>
}

export const RoutePermissionContext = createContext<RoutePermissionContextType | undefined>(undefined)

export function RoutePermissionProvider({ children }: { children: ReactNode }) {
    const { auth } = useAuthStore()
    const [rulesEnabled, setRulesEnabled] = useState(false)

    useEffect(() => {
        let cancelled = false

        const loadSession = async () => {
            const session = await fetchSession()
            if (cancelled) return
            setRulesEnabled(Boolean(session?.user))
        }

        void loadSession()

        return () => {
            cancelled = true
        }
    }, [auth.user?.id, auth.isSessionActive])

    const {
        data: rules = [],
        isLoading,
        refetch,
    } = useRoutePermissionRules(rulesEnabled)

    const [ability, setAbility] = useState<AppAbility>(() => defineAbilityForRules([], []))

    const rolesKey = useMemo(() => {
        const userRoles = auth.user?.roles || []
        return userRoles
            .map((role) => {
                if (typeof role === 'string') {
                    return role
                }
                if (role && typeof role === 'object' && typeof role.name === 'string') {
                    return role.name
                }
                return ''
            })
            .filter(Boolean)
            .join(',')
    }, [auth.user?.roles])

    useEffect(() => {
        const userRoles = auth.user?.roles || []
        const userRoleNames = userRoles
            .map((role) => {
                if (typeof role === 'string') {
                    return role
                }
                if (role && typeof role === 'object' && typeof role.name === 'string') {
                    return role.name
                }
                return ''
            })
            .filter((role): role is string => Boolean(role))

        const safeRules = Array.isArray(rules) ? rules : []
        setAbility(defineAbilityForRules(safeRules, userRoleNames))
    }, [rules, auth.user?.id, rolesKey])

    const refreshRules = async () => {
        await refetch()
    }

    return (
        <AbilityContext.Provider value={ability}>
            <RoutePermissionContext.Provider
                value={{
                    rules,
                    isLoading,
                    ability,
                    refreshRules,
                }}
            >
                {children}
            </RoutePermissionContext.Provider>
        </AbilityContext.Provider>
    )
}

export function useRoutePermissionOptional() {
    return useContext(RoutePermissionContext)
}

export function useRoutePermission() {
    const context = useRoutePermissionOptional()
    if (context === undefined) {
        throw new Error('useRoutePermission must be used within RoutePermissionProvider')
    }
    return context
}