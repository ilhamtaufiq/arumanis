import { useState, useEffect, useRef, Fragment, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { updateRoutePermission } from '../api';
import type { RoutePermission } from '../types';
import { getAllRoles } from '@/features/roles/api';
import { roleKeys } from '@/features/roles/hooks/useRoles';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, RefreshCw, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import type { Role } from '@/features/roles/types';
import {
    useAllRoutePermissions,
    useInvalidateRoutePermissionRules,
    useSyncRoutePermissions,
} from '../hooks/useRoutePermissions';

const SAVE_DEBOUNCE_MS = 300;
const EMPTY_PERMISSIONS: RoutePermission[] = [];
const EMPTY_ROLES: Role[] = [];

function buildRouteRoleMatrix(permissions: RoutePermission[], roles: Role[]): RouteRoleMatrix {
    const newMatrix: RouteRoleMatrix = {};

    permissions.forEach((perm) => {
        const key = `${perm.route_method}:${perm.route_path}`;
        const roleStates: { [roleName: string]: boolean } = {};
        roles.forEach((role) => {
            roleStates[role.name] = perm.allowed_roles?.includes(role.name) || false;
        });

        newMatrix[key] = {
            permission: perm,
            route_path: perm.route_path,
            route_method: perm.route_method,
            description: perm.description || '',
            roles: roleStates,
        };
    });

    return newMatrix;
}

function isSameMatrix(a: RouteRoleMatrix, b: RouteRoleMatrix): boolean {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    return keysA.every((key) => {
        const left = a[key];
        const right = b[key];
        if (!right) return false;

        return (
            left.permission.id === right.permission.id
            && left.permission.updated_at === right.permission.updated_at
            && left.route_path === right.route_path
            && left.route_method === right.route_method
            && left.description === right.description
            && JSON.stringify(left.roles) === JSON.stringify(right.roles)
        );
    });
}

interface RouteRoleMatrix {
    [routeKey: string]: {
        permission: RoutePermission;
        route_path: string;
        route_method: string;
        description: string;
        roles: { [roleName: string]: boolean };
    };
}

export default function RoutePermissionList() {
    const [matrix, setMatrix] = useState<RouteRoleMatrix>({});
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(20);
    const [savingRoutes, setSavingRoutes] = useState<Record<string, boolean>>({});
    const matrixRef = useRef(matrix);
    const saveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const invalidateRoutePermissionRules = useInvalidateRoutePermissionRules();
    const syncRoutePermissions = useSyncRoutePermissions();

    const {
        data: permissionsData,
        isLoading: permissionsLoading,
        isError: permissionsError,
    } = useAllRoutePermissions();
    const {
        data: allRolesData,
        isLoading: rolesLoading,
        isError: rolesError,
    } = useQuery({
        queryKey: [...roleKeys.all, 'all'] as const,
        queryFn: getAllRoles,
    });
    const permissions = permissionsData ?? EMPTY_PERMISSIONS;
    const roles = useMemo(
        () => (allRolesData ?? EMPTY_ROLES).filter((role) => role.name !== 'admin'),
        [allRolesData],
    );
    const isLoading = permissionsLoading || rolesLoading;

    useEffect(() => {
        matrixRef.current = matrix;
    }, [matrix]);

    useEffect(() => {
        if (permissionsError || rolesError) {
            toast.error('Gagal mengambil data');
        }
    }, [permissionsError, rolesError]);

    const sourceMatrix = useMemo(
        () => (roles.length === 0 ? {} : buildRouteRoleMatrix(permissions, roles)),
        [permissions, roles],
    );

    // Sync local matrix from server data without re-render loops.
    useEffect(() => {
        if (roles.length === 0) return;

        setMatrix((current) => (isSameMatrix(current, sourceMatrix) ? current : sourceMatrix));
    }, [roles.length, sourceMatrix]);

    const persistRoutePermission = useCallback(async (routeKey: string) => {
        const routeData = matrixRef.current[routeKey];
        if (!routeData) return;

        const allowedRoles = Object.entries(routeData.roles)
            .filter(([, isAllowed]) => isAllowed)
            .map(([name]) => name);

        setSavingRoutes((current) => ({ ...current, [routeKey]: true }));

        try {
            const updatedPermission = await updateRoutePermission({
                id: routeData.permission.id,
                data: {
                    route_path: routeData.route_path,
                    route_method: routeData.route_method as RoutePermission['route_method'],
                    description: routeData.description,
                    allowed_roles: allowedRoles,
                    is_active: true,
                },
            });

            setMatrix((prev) => ({
                ...prev,
                [routeKey]: {
                    ...prev[routeKey],
                    permission: updatedPermission,
                },
            }));

            void invalidateRoutePermissionRules();
        } catch (error: unknown) {
            console.error('Failed to auto-save route permission:', error);
            const message =
                (error as { data?: { message?: string }; message?: string })?.data?.message
                || (error as { message?: string })?.message
                || 'Gagal menyimpan perubahan';
            toast.error(`Gagal menyimpan perubahan: ${message}`);
        } finally {
            setSavingRoutes((current) => {
                const next = { ...current };
                delete next[routeKey];
                return next;
            });
        }
    }, [invalidateRoutePermissionRules]);

    const scheduleRouteSave = useCallback((routeKey: string) => {
        if (saveTimersRef.current[routeKey]) {
            clearTimeout(saveTimersRef.current[routeKey]);
        }

        saveTimersRef.current[routeKey] = setTimeout(() => {
            delete saveTimersRef.current[routeKey];
            void persistRoutePermission(routeKey);
        }, SAVE_DEBOUNCE_MS);
    }, [persistRoutePermission]);

    const handleCheckboxChange = (routeKey: string, roleName: string, checked: boolean) => {
        setMatrix((prev) => {
            const currentRoute = prev[routeKey];
            if (!currentRoute) return prev;

            const nextMatrix = {
                ...prev,
                [routeKey]: {
                    ...currentRoute,
                    roles: {
                        ...currentRoute.roles,
                        [roleName]: checked,
                    },
                },
            };

            matrixRef.current = nextMatrix;
            return nextMatrix;
        });

        scheduleRouteSave(routeKey);
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET': return 'bg-blue-100 text-blue-800';
            case 'POST': return 'bg-green-100 text-green-800';
            case 'PUT': return 'bg-yellow-100 text-yellow-800';
            case 'PATCH': return 'bg-orange-100 text-orange-800';
            case 'DELETE': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Filter matrix based on search
    const filteredMatrix = Object.entries(matrix).filter(([_, data]) =>
        data.route_path.toLowerCase().includes(search.toLowerCase()) ||
        data.description.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination logic
    const totalItems = filteredMatrix.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const paginatedMatrix = filteredMatrix.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );

    // Group by route path prefix
    const groupedRoutes = paginatedMatrix.reduce((acc, [key, data]) => {
        const prefix = data.route_path.split('/')[1] || 'other';
        if (!acc[prefix]) acc[prefix] = [];
        acc[prefix].push({ key, data });
        return acc;
    }, {} as Record<string, { key: string; data: RouteRoleMatrix[string] }[]>);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Route Permissions</h1>
                    <p className="text-muted-foreground">
                        Sinkronkan route API dari backend, lalu centang role yang boleh mengakses setiap route. Admin selalu punya akses.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => syncRoutePermissions.mutate({})}
                        disabled={syncRoutePermissions.isPending}
                    >
                        {syncRoutePermissions.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Sinkronkan Route
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="secondary" disabled={syncRoutePermissions.isPending}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Sinkron + Bersihkan
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Bersihkan route permission usang?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Aksi ini akan menambahkan route API baru dari backend, lalu menghapus entri permission
                                    untuk route yang sudah tidak terdaftar lagi di Laravel.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => syncRoutePermissions.mutate({ clean: true })}
                                >
                                    Ya, sinkronkan dan bersihkan
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari route..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[100px] sticky left-0 bg-muted/50">Method</TableHead>
                            <TableHead className="min-w-[250px] sticky left-[100px] bg-muted/50">Route Path</TableHead>
                            <TableHead className="min-w-[200px]">Deskripsi</TableHead>
                            {roles.map(role => (
                                <TableHead key={role.id} className="text-center w-[100px]">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-xs font-medium capitalize">{role.name}</span>
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.entries(groupedRoutes).length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3 + roles.length} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                        <p>Belum ada route permission di database.</p>
                                        <Button
                                            onClick={() => syncRoutePermissions.mutate({})}
                                            disabled={syncRoutePermissions.isPending}
                                        >
                                            {syncRoutePermissions.isPending ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                            )}
                                            Sinkronkan dari Backend
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : Object.entries(groupedRoutes).map(([group, routes]) => (
                            <Fragment key={`group-section-${group}`}>
                                <TableRow key={`group-header-${group}`} className="bg-muted/30">
                                    <TableCell colSpan={3 + roles.length} className="py-2">
                                        <span className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                                            {group}
                                        </span>
                                    </TableCell>
                                </TableRow>
                                {routes.map(({ key, data }) => (
                                    <TableRow key={`route-${key}`} className="hover:bg-muted/20">
                                        <TableCell className="sticky left-0 bg-background">
                                            <Badge className={cn("text-xs", getMethodColor(data.route_method))}>
                                                {data.route_method}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm sticky left-[100px] bg-background">
                                            <span className="inline-flex items-center gap-2">
                                                {data.route_path}
                                                {savingRoutes[key] && (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                                )}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {data.description}
                                        </TableCell>
                                        {roles.map(role => (
                                            <TableCell key={`role-${role.id}`} className="text-center">
                                                <Checkbox
                                                    checked={data.roles[role.name] || false}
                                                    onCheckedChange={(checked) =>
                                                        handleCheckboxChange(key, role.name, checked as boolean)
                                                    }
                                                    className="mx-auto"
                                                />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </Fragment>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                                    }}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>

                            {(() => {
                                const items = [];
                                const maxVisiblePages = 5;

                                if (totalPages <= maxVisiblePages) {
                                    for (let i = 1; i <= totalPages; i++) items.push(i);
                                } else {
                                    if (currentPage <= 3) {
                                        for (let i = 1; i <= 3; i++) items.push(i);
                                        items.push('ellipsis');
                                        items.push(totalPages);
                                    } else if (currentPage >= totalPages - 2) {
                                        items.push(1);
                                        items.push('ellipsis');
                                        for (let i = totalPages - 2; i <= totalPages; i++) items.push(i);
                                    } else {
                                        items.push(1);
                                        items.push('ellipsis');
                                        items.push(currentPage - 1);
                                        items.push(currentPage);
                                        items.push(currentPage + 1);
                                        items.push('ellipsis');
                                        items.push(totalPages);
                                    }
                                }

                                return items.map((item, index) => (
                                    <PaginationItem key={index}>
                                        {item === 'ellipsis' ? (
                                            <PaginationEllipsis />
                                        ) : (
                                            <PaginationLink
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurrentPage(item as number);
                                                }}
                                                isActive={currentPage === item}
                                                className="cursor-pointer"
                                            >
                                                {item}
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ));
                            })()}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                                    }}
                                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}