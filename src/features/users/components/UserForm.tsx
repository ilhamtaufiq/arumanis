import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from '@tanstack/react-router';
import { createUser, getUser, updateUser } from '../api';
import { getRoles } from '@/features/roles/api';
import { getPermissions } from '@/features/permissions/api';
import type { Role } from '@/features/roles/types';
import type { Permission } from '@/features/permissions/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import PageContainer from '@/components/layout/page-container';
import { ArrowLeft, Save } from 'lucide-react';

export default function UserForm() {
    const params = useParams({ strict: false });
    const id = params.id;
    const navigate = useNavigate();
    const isEdit = !!id;
    const [isLoading, setIsLoading] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        nip: '',
        jabatan: '',
        roles: [] as string[],
        permissions: [] as string[],
    });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [rolesData, permissionsData] = await Promise.all([
                    getRoles({ page: 1 }), // Fetching page 1 for now
                    getPermissions({ page: 1 }), // Fetching page 1 for now
                ]);
                setRoles(rolesData.data);
                setPermissions(permissionsData.data);
            } catch (error) {
                console.error('Failed to fetch options:', error);
                toast.error('Gagal memuat data roles/permissions');
            }
        };

        fetchOptions();

        if (isEdit && id) {
            const fetchData = async () => {
                try {
                    const data = await getUser(parseInt(id));
                    setFormData({
                        name: data.name,
                        email: data.email,
                        password: '', // Don't populate password
                        nip: data.nip || '',
                        jabatan: data.jabatan || '',
                        roles: data.roles.map(r => r.name),
                        permissions: data.permissions.map(p => p.name),
                    });
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                    toast.error('Gagal memuat data user');
                    navigate({ to: '/settings' });
                }
            };
            fetchData();
        }
    }, [isEdit, id, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (roleName: string, checked: boolean) => {
        setFormData(prev => {
            const newRoles = checked
                ? [...prev.roles, roleName]
                : prev.roles.filter(r => r !== roleName);
            return { ...prev, roles: newRoles };
        });
    };

    const handlePermissionChange = (permissionName: string, checked: boolean) => {
        setFormData(prev => {
            const newPermissions = checked
                ? [...prev.permissions, permissionName]
                : prev.permissions.filter(p => p !== permissionName);
            return { ...prev, permissions: newPermissions };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const { password, ...rest } = formData;
            const payload = password ? formData : rest;

            if (isEdit && id) {
                await updateUser({ id: parseInt(id), data: payload });
                toast.success('User berhasil diperbarui');
            } else {
                await createUser(payload);
                toast.success('User berhasil ditambahkan');
            }
            navigate({ to: '/settings' });
        } catch (error) {
            console.error('Failed to save user:', error);
            toast.error('Gagal menyimpan user');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer>
            <div className="w-full space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/settings">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEdit ? 'Edit User' : 'Tambah User Baru'}
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form User</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nama lengkap"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email address"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Password {isEdit && '(Kosongkan jika tidak ingin mengubah)'}
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    required={!isEdit}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nip">NIP</Label>
                                    <Input
                                        id="nip"
                                        name="nip"
                                        value={formData.nip}
                                        onChange={handleChange}
                                        placeholder="Nomor Induk Pegawai"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jabatan">Jabatan</Label>
                                    <Input
                                        id="jabatan"
                                        name="jabatan"
                                        value={formData.jabatan}
                                        onChange={handleChange}
                                        placeholder="Jabatan pegawai"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Roles</Label>
                                <div className="border rounded-md p-4">
                                    <ScrollArea className="h-[200px]">
                                        <div className="grid grid-cols-2 gap-4">
                                            {roles.map((role) => (
                                                <div key={role.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`role-${role.id}`}
                                                        checked={formData.roles.includes(role.name)}
                                                        onCheckedChange={(checked) => handleRoleChange(role.name, checked as boolean)}
                                                    />
                                                    <Label htmlFor={`role-${role.id}`} className="font-normal cursor-pointer">
                                                        {role.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Permissions (Direct)</Label>
                                <div className="border rounded-md p-4">
                                    <ScrollArea className="h-[200px]">
                                        <div className="grid grid-cols-2 gap-4">
                                            {permissions.map((permission) => (
                                                <div key={permission.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`perm-${permission.id}`}
                                                        checked={formData.permissions.includes(permission.name)}
                                                        onCheckedChange={(checked) => handlePermissionChange(permission.name, checked as boolean)}
                                                    />
                                                    <Label htmlFor={`perm-${permission.id}`} className="font-normal cursor-pointer">
                                                        {permission.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate({ to: '/settings' })}
                                    disabled={isLoading}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isLoading ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    );
}
