import { type ReactNode } from 'react';
import { useLocation, Link } from '@tanstack/react-router';
import { useRoutePermission } from '@/context/route-permission-context';
import { useAuthStore } from '@/stores/auth-stores';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import type { RoutePermissionRule } from '@/features/route-permissions/types';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredPath: string;
    requiredMethod?: string;
    redirectTo?: string;
}

/**
 * Routes that are admin-only by default (if no specific rule exists in database)
 * These routes will be denied for non-admin users unless explicitly allowed
 */
const ADMIN_ONLY_ROUTES = [
    '/kegiatan',
    '/desa',
    '/kecamatan',
    '/kontrak',
    '/output',
    '/penerima',
    '/users',
    '/roles',
    '/permissions',
    '/route-permissions',
    '/menu-permissions',
    '/kegiatan-role',
    '/berkas',
    '/settings',
];

/**
 * Check if a route is in the admin-only list
 */
function isAdminOnlyRoute(path: string): boolean {
    // Check exact match first
    if (ADMIN_ONLY_ROUTES.includes(path)) {
        return true;
    }
    // Check if the base path (first segment) is admin-only
    // e.g., /kegiatan/123 should match /kegiatan
    const basePath = '/' + path.split('/').filter(Boolean)[0];
    return ADMIN_ONLY_ROUTES.includes(basePath);
}

/**
 * Check if a route pattern matches an actual path
 * Pattern: /pekerjaan/:id matches /pekerjaan/397
 * Pattern: /users/:userId/edit matches /users/5/edit
 */
function matchesPattern(pattern: string, path: string): boolean {
    if (!pattern.includes(':')) {
        return pattern === path;
    }

    // Convert pattern to regex
    // :id, :userId, :pekerjaanId etc. -> matches any non-slash characters
    const regexStr = pattern.replace(/:[a-zA-Z_]+/g, '([^/]+)');
    const regex = new RegExp(`^${regexStr}$`);

    return regex.test(path);
}

/**
 * Check if user has access to a specific route, with pattern matching support
 */
function checkRouteAccess(
    rules: RoutePermissionRule[],
    userRoles: string[],
    requiredPath: string,
    requiredMethod: string
): boolean {
    const method = requiredMethod.toUpperCase();

    // Admin bypass - admin can access everything
    if (userRoles.includes('admin')) {
        return true;
    }

    // Find matching rule (exact or pattern)
    const matchingRule = rules.find(rule => {
        if (rule.route_method.toUpperCase() !== method) {
            return false;
        }
        return matchesPattern(rule.route_path, requiredPath);
    });

    // If a rule exists, check if user has the required role
    if (matchingRule) {
        // No role restrictions means everyone can access
        if (!matchingRule.allowed_roles || matchingRule.allowed_roles.length === 0) {
            return true;
        }
        return matchingRule.allowed_roles.some(role => userRoles.includes(role));
    }

    // No rule found - check if this is an admin-only route
    if (isAdminOnlyRoute(requiredPath)) {
        // Admin-only routes are denied for non-admin users
        return false;
    }

    // For non-admin-only routes without rules, allow access
    return true;
}

export function ProtectedRoute({
    children,
    requiredPath,
    requiredMethod = 'GET',
    redirectTo = '/'
}: ProtectedRouteProps) {
    const { rules, isLoading } = useRoutePermission();
    const { auth } = useAuthStore();
    const location = useLocation();

    // Show loading state while checking permissions
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Memeriksa akses...</p>
                </div>
            </div>
        );
    }

    // Get user roles
    const userRoles = (auth.user?.roles || []).map((r: any) =>
        typeof r === 'string' ? r : r.name
    );

    // Check if user has access with pattern matching
    const hasAccess = checkRouteAccess(rules, userRoles, requiredPath, requiredMethod);

    console.log('🔍 ProtectedRoute Check:', {
        path: requiredPath,
        method: requiredMethod.toUpperCase(),
        hasAccess,
        userRoles,
        location: location.pathname
    });

    if (!hasAccess) {
        // Try to get redirect from search params if available, otherwise default to -1 (back)
        // Note: TanStack router doesn't support -1 in Link directly like react-router-dom
        // We'll use window.history.back() for the "Kembali" button logic or just link to root

        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <ShieldAlert className="h-6 w-6 text-red-600" />
                            <CardTitle>Akses Ditolak</CardTitle>
                        </div>
                        <CardDescription>
                            Anda tidak memiliki permission untuk mengakses halaman ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Route: <code className="bg-muted px-2 py-1 rounded">{requiredPath}</code>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.
                        </p>
                        <div className="flex space-x-2">
                            <Button asChild variant="default">
                                <Link to={redirectTo}>Kembali ke Dashboard</Link>
                            </Button>
                            <Button variant="outline" onClick={() => window.history.back()}>
                                Kembali
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}

