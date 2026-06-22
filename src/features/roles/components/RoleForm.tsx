import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from '@tanstack/react-router';
import { createRole, updateRole } from '../api';
import { useRoleDetail } from '../hooks/useRoles';
import type { Role } from '../types';
import { getPermissions } from '@/features/permissions/api';
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

export default function RoleForm() {
    const params = useParams({ strict: false });
    const id = params.id;
    const navigate = useNavigate();
    const isEdit = !!id;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isLoading = isSubmitting || (isEdit && loadingDetail);
    const [permissions, setPermissions] = useState<Permission[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        permissions: [] as string[],
    });

    const { data: roleRes, isLoading: loadingDetail, isError } = useRoleDetail(parseInt(id || '0'), isEdit && !!id);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await getPermissions({ page: 1 });
                setPermissions(response.data);
            } catch (error) {
                console.error('Failed to fetch permissions:', error);
                toast.error('Gagal memuat data permissions');
            }
        };

        fetchPermissions();
    }, []);

    useEffect(() => {
        if (!isEdit || !roleRes) return;

        const data = roleRes as Role;
        setFormData({
            name: data.name,
            permissions: data.permissions.map(p => p.name),
        });
    }, [isEdit, roleRes]);

    useEffect(() => {
        if (isError) {
            console.error('Failed to fetch role');
            toast.error('Gagal memuat data role');
            navigate({ to: '/settings' });
        }
    }, [isError, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
            setIsSubmitting(true);
            if (isEdit && id) {
                await updateRole({ id: parseInt(id), data: formData });
                toast.success('Role berhasil diperbarui');
            } else {
                await createRole(formData);
                toast.success('Role berhasil ditambahkan');
            }
            navigate({ to: '/settings' });
        } catch (error) {
            console.error('Failed to save role:', error);
            toast.error('Gagal menyimpan role');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageContainer>
            <div className="w-full space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="icon" className="rounded-full" asChild>
                        <Link to="/settings">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEdit ? 'Edit Role' : 'Tambah Role Baru'}
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Role</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Role</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nama role"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Permissions</Label>
                                <div className="border rounded-md p-4">
                                    <ScrollArea className="h-[300px]">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
