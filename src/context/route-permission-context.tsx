import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { getRoutePermissionRules } from '@/features/route-permissions/api';
import type { RoutePermissionRule } from '@/features/route-permissions/types';
import { useAuthStore } from '@/stores/auth-stores';
import { defineAbilityForRules, AppAbility } from '@/config/ability';
import { AbilityContext } from './AbilityContext';

interface RoutePermissionContextType {
    rules: RoutePermissionRule[];
    isLoading: boolean;
    ability: AppAbility;
    refreshRules: () => Promise<void>;
}

const RoutePermissionContext = createContext<RoutePermissionContextType | undefined>(undefined);

export function RoutePermissionProvider({ children }: { children: ReactNode }) {
    const [rules, setRules] = useState<RoutePermissionRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { auth } = useAuthStore();
    const [ability, setAbility] = useState<AppAbility>(() => defineAbilityForRules([], []));

    const fetchRules = async () => {
        try {
            setIsLoading(true);
            const data = await getRoutePermissionRules();
            setRules(data);
        } catch (error) {
            console.error('Failed to fetch route permission rules:', error);
            setRules([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Only fetch rules if user is authenticated
        if (auth.accessToken) {
            fetchRules();
        } else {
            // Reset rules and loading state for unauthenticated users
            setRules([]);
            setIsLoading(false);
        }
    }, [auth.accessToken]);

    // Memoize roles string to avoid infinite re-renders
    const rolesKey = useMemo(() => {
        const userRoles = auth.user?.roles || [];
        return userRoles.map((r: any) => typeof r === 'string' ? r : r.name).join(',');
    }, [auth.user?.roles]);

    // Update ability when rules or user roles change
    useEffect(() => {
        const userRoles = auth.user?.roles || [];
        // Normalize roles to strings
        const userRoleNames = userRoles.map((r: any) => typeof r === 'string' ? r : r.name);

        console.log('🔐 Building CASL Ability with:', {
            rulesCount: rules.length,
            userRoles: userRoleNames,
            rules: rules.map(r => ({ path: r.route_path, method: r.route_method, allowed_roles: r.allowed_roles }))
        });

        const newAbility = defineAbilityForRules(rules, userRoleNames);
        setAbility(newAbility);

        console.log('✅ CASL Ability built successfully');
    }, [rules, auth.user?.id, rolesKey]);

    return (
        <AbilityContext.Provider value={ability}>
            <RoutePermissionContext.Provider
                value={{
                    rules,
                    isLoading,
                    ability,
                    refreshRules: fetchRules
                }}
            >
                {children}
            </RoutePermissionContext.Provider>
        </AbilityContext.Provider>
    );
}

export function useRoutePermission() {
    const context = useContext(RoutePermissionContext);
    if (context === undefined) {
        throw new Error('useRoutePermission must be used within RoutePermissionProvider');
    }
    return context;
}
