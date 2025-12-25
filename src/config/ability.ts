import { AbilityBuilder, Ability } from '@casl/ability';
import type { AbilityClass } from '@casl/ability';
import type { RoutePermissionRule } from '@/features/route-permissions/types';

export type Actions = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'manage';
export type Subjects = string | 'all';

export type AppAbility = Ability<[Actions, Subjects]>;
export const AppAbility = Ability as AbilityClass<AppAbility>;

export function defineAbilityFor(rules: RoutePermissionRule[], userRoles: string[]) {
    const { can, build } = new AbilityBuilder(AppAbility);

    // Default rule: if no rules exist, allow everything (or handle as needed)
    // But based on previous logic: "If no rule exists for this route, allow access"
    // AND "If rule exists, check user roles"

    // However, CASL works best with explicit rules.
    // Strategy:
    // 1. We can't easily define "allow everything EXCEPT..." if the "EXCEPT" is dynamic and based on DB.
    //    Actually we can, but it's better to follow the previous logic.
    //    Previous logic:
    //    - Find rule for (path, method).
    //    - If NO rule found -> Allow.
    //    - If rule FOUND -> Check roles.

    // To implement "If NO rule found -> Allow" in CASL is tricky because CASL is usually "deny by default" or "allow by default".
    // If we "allow by default" (`can('manage', 'all')`), then we need `cannot(...)` for restricted routes.

    // Let's try "Allow All" first, then restrict based on rules.
    can('manage', 'all');

    rules.forEach(rule => {
        // If rule has allowed_roles, it means it's restricted.
        if (rule.allowed_roles && rule.allowed_roles.length > 0) {
            // Check if user has ANY of the allowed roles
            const hasRole = rule.allowed_roles.some(role => userRoles.includes(role));

            if (!hasRole) {
                // User does NOT have access.
                // We need to forbid this specific route and method.
                // Note: CASL matches subjects. Here subject is the route path.
                // We cast route_method to Actions.
                // @ts-ignore
                const action = rule.route_method.toUpperCase() as Actions;

                // cannot(action, rule.route_path);
                // But wait, if we use `cannot`, it overrides `can`.
                // So `can('manage', 'all')` + `cannot('GET', '/restricted')` works.

                // However, we need to be careful about matching.
                // If we use simple string matching, it must be exact.
                // The previous logic used: `r.route_path === normalizedPath`.
                // So exact match is fine.

                // @ts-ignore
                can(action, rule.route_path, { inverted: true }); // This is effectively `cannot`
                // actually `cannot` helper is available from AbilityBuilder but we destructured `can`.
                // Let's use `cannot` if we destructure it, or just `can(..., { inverted: true })` which is what `cannot` does.
            }
        }
    });

    // Wait, `AbilityBuilder` provides `cannot`. Let's use it for clarity.
    return build();
}

// Re-implement with allow-by-default and admin bypass
export function defineAbilityForRules(rules: RoutePermissionRule[], userRoles: string[]) {
    const { can, cannot, build } = new AbilityBuilder(AppAbility);

    // Admin bypass - admin can access everything
    if (userRoles.includes('admin')) {
        can('manage', 'all');
        return build();
    }

    // Allow all by default
    can('manage', 'all');

    // For non-admin: only restrict routes where user does NOT have the required role
    rules.forEach(rule => {
        if (rule.allowed_roles && rule.allowed_roles.length > 0) {
            const hasRole = rule.allowed_roles.some(role => userRoles.includes(role));

            if (!hasRole) {
                // User does NOT have permission for this route - deny access
                // @ts-ignore
                cannot(rule.route_method.toUpperCase() as Actions, rule.route_path);
            }
        }
    });

    return build();
}
