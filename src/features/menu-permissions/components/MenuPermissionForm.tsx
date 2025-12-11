import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from '@tanstack/react-router';
import { createMenuPermission, getMenuPermission, updateMenuPermission } from '../api';
import { getRoles } from '@/features/roles/api';
import type { Role } from '@/features/roles/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import PageContainer from '@/components/layout/page-container';
import { ArrowLeft, Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function MenuPermissionForm() {
    const params = useParams({ strict: false });
    const id = params.id;
    const navigate = useNavigate();
    const isEdit = !!id;
    const [isLoading, setIsLoading] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);

    const [formData, setFormData] = useState({
        menu_key: '',
        menu_label: '',
        menu_parent: '',
        allowed_roles: [] as string[],
        is_active: true,
    });

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await getRoles({ page: 1 });
                setRoles(response.data);
            } catch (error) {
                console.error('Failed to fetch roles:', error);
                toast.error('Gagal memuat data roles');
            }
        };

        fetchRoles();

        if (isEdit && id) {
            const fetchData = async () => {
                try {
                    const data = await getMenuPermission(parseInt(id));
                    setFormData({
                        menu_key: data.menu_key,
                        menu_label: data.menu_label,
                        menu_parent: data.menu_parent || '',
                        allowed_roles: data.allowed_roles || [],
                        is_active: data.is_active,
                    });
                } catch (error) {
                    console.error('Failed to fetch menu permission:', error);
                    toast.error('Gagal memuat data menu permission');
                    navigate({ to: '/menu-permissions' });
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
                ? [...prev.allowed_roles, roleName]
                : prev.allowed_roles.filter(r => r !== roleName);
            return { ...prev, allowed_roles: newRoles };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);

            // Clean up empty menu_parent
            const submitData = {
                ...formData,
                menu_parent: formData.menu_parent || null,
            };

            if (isEdit && id) {
                await updateMenuPermission({ id: parseInt(id), data: submitData });
                toast.success('Menu permission berhasil diperbarui');
            } else {
                await createMenuPermission(submitData);
                toast.success('Menu permission berhasil ditambahkan');
            }
            navigate({ to: '/menu-permissions' });
        } catch (error) {
            console.error('Failed to save menu permission:', error);
            toast.error('Gagal menyimpan menu permission');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/menu-permissions">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEdit ? 'Edit Menu Permission' : 'Tambah Menu Permission Baru'}
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Menu Permission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="menu_key">Menu Key</Label>
                                <Input
                                    id="menu_key"
                                    name="menu_key"
                                    value={formData.menu_key}
                                    onChange={handleChange}
                                    placeholder="e.g., dashboard, users, settings"
                                    required
                                />
                                <p className="text-sm text-muted-foreground">
                                    Unique identifier untuk menu (gunakan lowercase dengan underscore)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="menu_label">Menu Label</Label>
                                <Input
                                    id="menu_label"
                                    name="menu_label"
                                    value={formData.menu_label}
                                    onChange={handleChange}
                                    placeholder="e.g., Dashboard, Users, Settings"
                                    required
                                />
                                <p className="text-sm text-muted-foreground">
                                    Label menu yang akan ditampilkan di sidebar
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="menu_parent">Menu Parent (Optional)</Label>
                                <Input
                                    id="menu_parent"
                                    name="menu_parent"
                                    value={formData.menu_parent}
                                    onChange={handleChange}
                                    placeholder="e.g., settings"
                                />
                                <p className="text-sm text-muted-foreground">
                                    Menu key dari parent menu (jika ini adalah submenu)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Allowed Roles</Label>
                                <div className="border rounded-md p-4">
                                    <ScrollArea className="h-[200px]">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {roles.map((role) => (
                                                <div key={role.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`role-${role.id}`}
                                                        checked={formData.allowed_roles.includes(role.name)}
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
                                <p className="text-sm text-muted-foreground">
                                    Kosongkan untuk mengizinkan semua role melihat menu ini
                                </p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    Aktifkan permission check untuk menu ini
                                </Label>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate({ to: '/menu-permissions' })}
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
