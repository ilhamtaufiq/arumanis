import { useState, useEffect, useCallback } from 'react';
import { useRoutePermission } from '@/context/route-permission-context';
import { getRoutePermissions, updateRoutePermission, createRoutePermission } from '../api';
import { getRoles } from '@/features/roles/api';
import type { RoutePermission } from '../types';
import type { Role } from '@/features/roles/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RouteRoleMatrix {
    [routeKey: string]: {
        permission: RoutePermission | null;
        route_path: string;
        route_method: string;
        description: string;
        roles: { [roleName: string]: boolean };
    };
}

// Predefined routes that should always appear
const PREDEFINED_ROUTES = [
    // Pekerjaan
    { path: '/pekerjaan', method: 'GET', description: 'Lihat daftar pekerjaan' },
    { path: '/pekerjaan', method: 'POST', description: 'Tambah pekerjaan' },
    { path: '/pekerjaan/:id', method: 'GET', description: 'Lihat detail pekerjaan' },
    { path: '/pekerjaan/:id', method: 'PUT', description: 'Edit pekerjaan' },
    { path: '/pekerjaan/:id', method: 'DELETE', description: 'Hapus pekerjaan' },
    // Kegiatan
    { path: '/kegiatan', method: 'GET', description: 'Lihat daftar kegiatan' },
    { path: '/kegiatan', method: 'POST', description: 'Tambah kegiatan' },
    { path: '/kegiatan/:id', method: 'GET', description: 'Lihat detail kegiatan' },
    { path: '/kegiatan/:id', method: 'PUT', description: 'Edit kegiatan' },
    { path: '/kegiatan/:id', method: 'DELETE', description: 'Hapus kegiatan' },
    // Kontrak
    { path: '/kontrak', method: 'GET', description: 'Lihat daftar kontrak' },
    { path: '/kontrak', method: 'POST', description: 'Tambah kontrak' },
    { path: '/kontrak/:id', method: 'GET', description: 'Lihat detail kontrak' },
    { path: '/kontrak/:id', method: 'PUT', description: 'Edit kontrak' },
    { path: '/kontrak/:id', method: 'DELETE', description: 'Hapus kontrak' },
    // Output
    { path: '/output', method: 'GET', description: 'Lihat daftar output' },
    { path: '/output', method: 'POST', description: 'Tambah output' },
    { path: '/output/:id', method: 'GET', description: 'Lihat detail output' },
    { path: '/output/:id', method: 'PUT', description: 'Edit output' },
    { path: '/output/:id', method: 'DELETE', description: 'Hapus output' },
    // Penerima
    { path: '/penerima', method: 'GET', description: 'Lihat daftar penerima' },
    { path: '/penerima', method: 'POST', description: 'Tambah penerima' },
    { path: '/penerima/:id', method: 'GET', description: 'Lihat detail penerima' },
    { path: '/penerima/:id', method: 'PUT', description: 'Edit penerima' },
    { path: '/penerima/:id', method: 'DELETE', description: 'Hapus penerima' },
    // Foto
    { path: '/foto', method: 'GET', description: 'Lihat daftar foto' },
    { path: '/foto', method: 'POST', description: 'Tambah foto' },
    { path: '/foto/:id', method: 'GET', description: 'Lihat detail foto' },
    { path: '/foto/:id', method: 'PUT', description: 'Edit foto' },
    { path: '/foto/:id', method: 'DELETE', description: 'Hapus foto' },
    // Berkas
    { path: '/berkas', method: 'GET', description: 'Lihat daftar berkas' },
    { path: '/berkas', method: 'POST', description: 'Tambah berkas' },
    { path: '/berkas/:id', method: 'GET', description: 'Lihat detail berkas' },
    { path: '/berkas/:id', method: 'PUT', description: 'Edit berkas' },
    { path: '/berkas/:id', method: 'DELETE', description: 'Hapus berkas' },
    // Desa
    { path: '/desa', method: 'GET', description: 'Lihat daftar desa' },
    { path: '/desa', method: 'POST', description: 'Tambah desa' },
    { path: '/desa/:id', method: 'PUT', description: 'Edit desa' },
    { path: '/desa/:id', method: 'DELETE', description: 'Hapus desa' },
    // Kecamatan
    { path: '/kecamatan', method: 'GET', description: 'Lihat daftar kecamatan' },
    { path: '/kecamatan', method: 'POST', description: 'Tambah kecamatan' },
    { path: '/kecamatan/:id', method: 'PUT', description: 'Edit kecamatan' },
    { path: '/kecamatan/:id', method: 'DELETE', description: 'Hapus kecamatan' },
];

export default function RoutePermissionList() {
    const [permissions, setPermissions] = useState<RoutePermission[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [matrix, setMatrix] = useState<RouteRoleMatrix>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const { refreshRules } = useRoutePermission();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);

            // Fetch all permissions (no pagination for matrix view)
            const permResponse = await getRoutePermissions({ per_page: 1000 } as any);
            setPermissions(permResponse.data);

            // Fetch all roles
            const roleResponse = await getRoles({ per_page: 100 } as any);
            setRoles(roleResponse.data.filter(r => r.name !== 'admin')); // Exclude admin (always has access)

        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Gagal mengambil data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Build matrix when permissions or roles change
    useEffect(() => {
        if (roles.length === 0) return;

        const newMatrix: RouteRoleMatrix = {};

        // Add predefined routes
        PREDEFINED_ROUTES.forEach(route => {
            const key = `${route.method}:${route.path}`;
            const existingPerm = permissions.find(
                p => p.route_path === route.path && p.route_method === route.method
            );

            const roleStates: { [roleName: string]: boolean } = {};
            roles.forEach(role => {
                roleStates[role.name] = existingPerm?.allowed_roles?.includes(role.name) || false;
            });

            newMatrix[key] = {
                permission: existingPerm || null,
                route_path: route.path,
                route_method: route.method,
                description: existingPerm?.description || route.description,
                roles: roleStates,
            };
        });

        // Add any existing permissions not in predefined routes
        permissions.forEach(perm => {
            const key = `${perm.route_method}:${perm.route_path}`;
            if (!newMatrix[key]) {
                const roleStates: { [roleName: string]: boolean } = {};
                roles.forEach(role => {
                    roleStates[role.name] = perm.allowed_roles?.includes(role.name) || false;
                });

                newMatrix[key] = {
                    permission: perm,
                    route_path: perm.route_path,
                    route_method: perm.route_method,
                    description: perm.description || '',
                    roles: roleStates,
                };
            }
        });

        setMatrix(newMatrix);
    }, [permissions, roles]);

    const handleCheckboxChange = (routeKey: string, roleName: string, checked: boolean) => {
        setMatrix(prev => ({
            ...prev,
            [routeKey]: {
                ...prev[routeKey],
                roles: {
                    ...prev[routeKey].roles,
                    [roleName]: checked,
                },
            },
        }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);

            for (const [key, routeData] of Object.entries(matrix)) {
                const allowedRoles = Object.entries(routeData.roles)
                    .filter(([_, isAllowed]) => isAllowed)
                    .map(([roleName]) => roleName);

                // Skip if no roles are selected (don't create empty permission)
                if (allowedRoles.length === 0 && !routeData.permission) {
                    continue;
                }

                const formData = {
                    route_path: routeData.route_path,
                    route_method: routeData.route_method as any,
                    description: routeData.description,
                    allowed_roles: allowedRoles,
                    is_active: true,
                };

                if (routeData.permission) {
                    // Update existing
                    await updateRoutePermission({
                        id: routeData.permission.id,
                        data: formData
                    });
                } else if (allowedRoles.length > 0) {
                    // Create new
                    await createRoutePermission(formData);
                }
            }

            toast.success('Permissions berhasil disimpan!');
            setHasChanges(false);
            await refreshRules();
            fetchData(); // Reload data

        } catch (error) {
            console.error('Failed to save permissions:', error);
            toast.error('Gagal menyimpan permissions');
        } finally {
            setIsSaving(false);
        }
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

    // Group by route path prefix
    const groupedRoutes = filteredMatrix.reduce((acc, [key, data]) => {
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Route Permissions</h1>
                    <p className="text-muted-foreground">
                        Centang role yang boleh mengakses setiap route. Admin selalu punya akses.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className="gap-2"
                >
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    Simpan Perubahan
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari route..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                {hasChanges && (
                    <Badge variant="outline" className="text-amber-600 border-amber-300">
                        Ada perubahan belum disimpan
                    </Badge>
                )}
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
                        {Object.entries(groupedRoutes).map(([group, routes]) => (
                            <>
                                <TableRow key={`group-${group}`} className="bg-muted/30">
                                    <TableCell colSpan={3 + roles.length} className="py-2">
                                        <span className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                                            {group}
                                        </span>
                                    </TableCell>
                                </TableRow>
                                {routes.map(({ key, data }) => (
                                    <TableRow key={key} className="hover:bg-muted/20">
                                        <TableCell className="sticky left-0 bg-background">
                                            <Badge className={cn("text-xs", getMethodColor(data.route_method))}>
                                                {data.route_method}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm sticky left-[100px] bg-background">
                                            {data.route_path}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {data.description}
                                        </TableCell>
                                        {roles.map(role => (
                                            <TableCell key={role.id} className="text-center">
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
                            </>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
