import { type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useRoutePermission } from '@/context/route-permission-context';
import { useAuthStore } from '@/stores/auth-stores';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RoutePermissionRule } from '@/features/route-permissions/types';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredPath: string;
    requiredMethod?: string;
    redirectTo?: string;
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

    // Deny by default - if no rule found, deny access
    if (!matchingRule) {
        return false;
    }

    // Check if user has any of the allowed roles
    if (!matchingRule.allowed_roles || matchingRule.allowed_roles.length === 0) {
        return true; // No role restrictions
    }

    return matchingRule.allowed_roles.some(role => userRoles.includes(role));
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
                            <Button asChild variant="outline">
                                <Link to={location.state?.from || -1 as any}>Kembali</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}

