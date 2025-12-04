import { type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useRoutePermission } from '@/context/route-permission-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredPath: string;
    requiredMethod?: string;
    redirectTo?: string;
}

export function ProtectedRoute({
    children,
    requiredPath,
    requiredMethod = 'GET',
    redirectTo = '/'
}: ProtectedRouteProps) {
    const { ability, isLoading } = useRoutePermission();
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

    // Check if user has access
    // @ts-ignore
    const hasAccess = ability.can(requiredMethod.toUpperCase(), requiredPath);

    console.log('🔍 ProtectedRoute Check:', {
        path: requiredPath,
        method: requiredMethod.toUpperCase(),
        hasAccess,
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
