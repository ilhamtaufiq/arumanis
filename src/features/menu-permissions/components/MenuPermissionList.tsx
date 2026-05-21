import { useCallback, useEffect, useMemo, useState } from 'react';
import { Save, Search, Shield, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { sidebarData } from '@/components/layout/data/sidebar-data';
import type { NavItem } from '@/components/layout/type';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getRoles } from '@/features/roles/api';
import type { Role } from '@/features/roles/types';
import { useMenuPermissionStore } from '@/stores/menu-permission-store';
import {
    createMenuPermission,
    deleteMenuPermission,
    getAllMenuPermissions,
    updateMenuPermission,
} from '../api';
import type { MenuPermission } from '../types';

type SidebarPermissionItem = {
    menu_key: string;
    menu_label: string;
    menu_parent: string;
    routes: string[];
    titles: string[];
};

type SelectionState = Record<string, string[]>;

function appendMenuItem(map: Map<string, SidebarPermissionItem>, item: NavItem | (NavItem & { url: string }), groupTitle: string) {
    if (!item.menuKey) return;

    const route = 'url' in item ? item.url : '';
    const existing = map.get(item.menuKey);

    if (existing) {
        if (route && !existing.routes.includes(route)) existing.routes.push(route);
        if (!existing.titles.includes(item.title)) existing.titles.push(item.title);
        return;
    }

    map.set(item.menuKey, {
        menu_key: item.menuKey,
        menu_label: item.title,
        menu_parent: groupTitle,
        routes: route ? [route] : [],
        titles: [item.title],
    });
}

function getSidebarPermissionItems() {
    const map = new Map<string, SidebarPermissionItem>();

    sidebarData.navGroups.forEach((group) => {
        group.items.forEach((item) => {
            appendMenuItem(map, item, group.title);

            if ('items' in item && item.items) {
                item.items.forEach((child) => appendMenuItem(map, child as NavItem & { url: string }, group.title));
            }
        });
    });

    return Array.from(map.values()).sort((a, b) => {
        if (a.menu_parent === b.menu_parent) return a.menu_label.localeCompare(b.menu_label);
        return a.menu_parent.localeCompare(b.menu_parent);
    });
}

async function getAllRoles() {
    const roles: Role[] = [];
    let page = 1;
    let lastPage = 1;

    do {
        const response = await getRoles({ page });
        roles.push(...response.data);
        lastPage = response.meta?.last_page ?? (response as unknown as { last_page?: number }).last_page ?? 1;
        page += 1;
    } while (page <= lastPage);

    return roles;
}

function normalizeRoles(permission: MenuPermission | undefined, roleNames: string[]) {
    if (!permission || !permission.is_active) return [];
    if (!permission.allowed_roles || permission.allowed_roles.length === 0) return roleNames;
    return permission.allowed_roles.filter((role) => roleNames.includes(role));
}

function sameRoles(left: string[], right: string[]) {
    if (left.length !== right.length) return false;
    const rightSet = new Set(right);
    return left.every((role) => rightSet.has(role));
}

export default function MenuPermissionList() {
    const sidebarMenus = useMemo(() => getSidebarPermissionItems(), []);
    const invalidateMenuPermissions = useMenuPermissionStore((state) => state.invalidateMenuPermissions);
    const fetchMenuPermissions = useMenuPermissionStore((state) => state.fetchMenuPermissions);
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<MenuPermission[]>([]);
    const [selections, setSelections] = useState<SelectionState>({});
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const perPage = 20;

    const roleNames = useMemo(() => roles.map((role) => role.name), [roles]);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [roleData, permissionData] = await Promise.all([
                getAllRoles(),
                getAllMenuPermissions(),
            ]);
            const names = roleData.map((role) => role.name);
            const permissionMap = new Map(permissionData.map((permission) => [permission.menu_key, permission]));
            const nextSelections = sidebarMenus.reduce<SelectionState>((acc, menu) => {
                acc[menu.menu_key] = normalizeRoles(permissionMap.get(menu.menu_key), names);
                return acc;
            }, {});

            setRoles(roleData);
            setPermissions(permissionData);
            setSelections(nextSelections);
        } catch (error) {
            console.error('Failed to fetch menu permissions:', error);
            toast.error('Gagal memuat konfigurasi menu');
        } finally {
            setIsLoading(false);
        }
    }, [sidebarMenus]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const permissionMap = useMemo(
        () => new Map(permissions.map((permission) => [permission.menu_key, permission])),
        [permissions]
    );

    const filteredMenus = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return sidebarMenus;

        return sidebarMenus.filter((menu) => {
            return [
                menu.menu_key,
                menu.menu_label,
                menu.menu_parent,
                ...menu.titles,
                ...menu.routes,
            ].some((value) => value.toLowerCase().includes(keyword));
        });
    }, [search, sidebarMenus]);

    const totalPages = Math.max(1, Math.ceil(filteredMenus.length / perPage));
    const paginatedMenus = useMemo(
        () => filteredMenus.slice((currentPage - 1) * perPage, currentPage * perPage),
        [currentPage, filteredMenus]
    );

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 3) {
            for (let i = 1; i <= 3; i++) pages.push(i);
            pages.push('ellipsis');
            pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1);
            pages.push('ellipsis');
            for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push('ellipsis');
            pages.push(currentPage - 1);
            pages.push(currentPage);
            pages.push(currentPage + 1);
            pages.push('ellipsis');
            pages.push(totalPages);
        }

        return (
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(event) => {
                                event.preventDefault();
                                if (currentPage > 1) setCurrentPage(currentPage - 1);
                            }}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>

                    {pages.map((page, index) => (
                        <PaginationItem key={index}>
                            {page === 'ellipsis' ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    href="#"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        setCurrentPage(page as number);
                                    }}
                                    isActive={currentPage === page}
                                    className="cursor-pointer"
                                >
                                    {page}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(event) => {
                                event.preventDefault();
                                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                            }}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    const toggleRole = (menuKey: string, roleName: string, checked: boolean) => {
        setSelections((current) => {
            const selectedRoles = current[menuKey] || [];
            const nextRoles = checked
                ? Array.from(new Set([...selectedRoles, roleName]))
                : selectedRoles.filter((role) => role !== roleName);

            return { ...current, [menuKey]: nextRoles };
        });
    };

    const setAllRoles = (menuKey: string, checked: boolean) => {
        setSelections((current) => ({
            ...current,
            [menuKey]: checked ? roleNames : [],
        }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);

            for (const menu of sidebarMenus) {
                const selectedRoles = selections[menu.menu_key] || [];
                const existing = permissionMap.get(menu.menu_key);

                if (selectedRoles.length === 0) {
                    if (existing) await deleteMenuPermission(existing.id);
                    continue;
                }

                const data = {
                    menu_key: menu.menu_key,
                    menu_label: menu.menu_label,
                    menu_parent: menu.menu_parent,
                    allowed_roles: selectedRoles,
                    is_active: true,
                };

                if (!existing) {
                    await createMenuPermission(data);
                    continue;
                }

                if (
                    existing.menu_label !== data.menu_label ||
                    existing.menu_parent !== data.menu_parent ||
                    !existing.is_active ||
                    !sameRoles(existing.allowed_roles || [], data.allowed_roles)
                ) {
                    await updateMenuPermission({ id: existing.id, data });
                }
            }

            invalidateMenuPermissions();
            await fetchMenuPermissions();
            toast.success('Menu permission berhasil disimpan');
            await fetchData();
        } catch (error) {
            console.error('Failed to save menu permissions:', error);
            toast.error('Gagal menyimpan menu permission');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Menu Permissions</h1>
                        <p className="text-muted-foreground">
                            Daftar menu otomatis mengikuti konfigurasi sidebar aplikasi.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchData} disabled={isLoading || isSaving}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Muat Ulang
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading || isSaving || roles.length === 0}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <CardTitle>Checklist Role per Menu</CardTitle>
                        <div className="relative w-full md:max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari menu, group, atau route..."
                                value={search}
                                onChange={(event) => handleSearchChange(event.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : roles.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            Tidak ada role yang bisa dikonfigurasi.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[260px]">Menu</TableHead>
                                        <TableHead className="min-w-[120px]">Group</TableHead>
                                        <TableHead className="w-[90px] text-center">Semua</TableHead>
                                        {roles.map((role) => (
                                            <TableHead key={role.id} className="min-w-[120px] text-center">
                                                {role.name}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredMenus.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={roles.length + 3} className="py-12 text-center text-muted-foreground">
                                                Tidak ada menu yang cocok.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedMenus.map((menu) => {
                                            const selectedRoles = selections[menu.menu_key] || [];
                                            const isAllSelected = selectedRoles.length === roleNames.length;

                                            return (
                                                <TableRow key={menu.menu_key}>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="font-medium">{menu.menu_label}</div>
                                                            <div className="font-mono text-xs text-muted-foreground">
                                                                {menu.menu_key}
                                                            </div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {menu.routes.map((route) => (
                                                                    <Badge key={route} variant="outline">
                                                                        {route}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{menu.menu_parent}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Checkbox
                                                            checked={isAllSelected}
                                                            onCheckedChange={(checked) => setAllRoles(menu.menu_key, checked === true)}
                                                            aria-label={`Pilih semua role untuk ${menu.menu_label}`}
                                                        />
                                                    </TableCell>
                                                    {roles.map((role) => (
                                                        <TableCell key={role.id} className="text-center">
                                                            <Checkbox
                                                                checked={selectedRoles.includes(role.name)}
                                                                onCheckedChange={(checked) => toggleRole(menu.menu_key, role.name, checked === true)}
                                                                aria-label={`${menu.menu_label} untuk ${role.name}`}
                                                            />
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    {filteredMenus.length > 0 && (
                        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <p className="text-sm text-muted-foreground">
                                Menampilkan {Math.min((currentPage - 1) * perPage + 1, filteredMenus.length)}-
                                {Math.min(currentPage * perPage, filteredMenus.length)} dari {filteredMenus.length} menu.
                            </p>
                            {renderPagination()}
                        </div>
                    )}
                    <p className="mt-4 text-sm text-muted-foreground">
                        Menu tanpa role terpilih tidak ditampilkan untuk non-admin. Admin tetap melihat semua menu.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
