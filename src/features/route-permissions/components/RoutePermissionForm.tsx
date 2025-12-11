import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from '@tanstack/react-router';
import { useRoutePermission } from '@/context/route-permission-context';
import { createRoutePermission, getRoutePermission, updateRoutePermission } from '../api';
import { getRoles } from '@/features/roles/api';
import type { Role } from '@/features/roles/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import PageContainer from '@/components/layout/page-container';
import { ArrowLeft, Save } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';

export default function RoutePermissionForm() {
    const params = useParams({ strict: false });
    const id = params.id;
    const navigate = useNavigate();
    const { refreshRules } = useRoutePermission();
    const isEdit = !!id;
    const [isLoading, setIsLoading] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);

    const [formData, setFormData] = useState({
        route_path: '',
        route_method: 'GET' as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        description: '',
        allowed_roles: [] as string[],
        is_active: true,
    });

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await getRoles();
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
                    const data = await getRoutePermission(parseInt(id));
                    setFormData({
                        route_path: data.route_path,
                        route_method: data.route_method,
                        description: data.description || '',
                        allowed_roles: data.allowed_roles,
                        is_active: data.is_active,
                    });
                } catch (error) {
                    console.error('Failed to fetch route permission:', error);
                    toast.error('Gagal memuat data route permission');
                    navigate({ to: '/settings' });
                }
            };
            fetchData();
        }
    }, [isEdit, id, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMethodChange = (value: string) => {
        setFormData(prev => ({ ...prev, route_method: value as typeof formData.route_method }));
    };

    const handleRoleChange = (roleName: string, checked: boolean) => {
        setFormData(prev => {
            const newRoles = checked
                ? [...prev.allowed_roles, roleName]
                : prev.allowed_roles.filter(r => r !== roleName);
            return { ...prev, allowed_roles: newRoles };
        });
    };

    const handleActiveChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, is_active: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.allowed_roles.length === 0) {
            toast.error('Pilih minimal satu role');
            return;
        }

        try {
            setIsLoading(true);
            if (isEdit && id) {
                await updateRoutePermission({ id: parseInt(id), data: formData });
                toast.success('Route permission berhasil diperbarui');
            } else {
                await createRoutePermission(formData);
                toast.success('Route permission berhasil ditambahkan');
            }
            await refreshRules(); // Refresh rules in context
            navigate({ to: '/settings' });
        } catch (error: any) {
            console.error('Failed to save route permission:', error);
            const message = error?.response?.data?.message || 'Gagal menyimpan route permission';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/settings">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEdit ? 'Edit Route Permission' : 'Tambah Route Permission Baru'}
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Route Permission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 md:col-span-1 space-y-2">
                                    <Label htmlFor="route_path">Route Path *</Label>
                                    <Input
                                        id="route_path"
                                        name="route_path"
                                        value={formData.route_path}
                                        onChange={handleChange}
                                        placeholder="/pekerjaan/new"
                                        required
                                        className="font-mono"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Contoh: /pekerjaan, /kontrak/new, /users/:id/edit
                                    </p>
                                </div>

                                <div className="col-span-2 md:col-span-1 space-y-2">
                                    <Label htmlFor="route_method">HTTP Method *</Label>
                                    <Select
                                        value={formData.route_method}
                                        onValueChange={handleMethodChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GET">GET</SelectItem>
                                            <SelectItem value="POST">POST</SelectItem>
                                            <SelectItem value="PUT">PUT</SelectItem>
                                            <SelectItem value="PATCH">PATCH</SelectItem>
                                            <SelectItem value="DELETE">DELETE</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Deskripsi route ini..."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Allowed Roles *</Label>
                                <div className="border rounded-md p-4">
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
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Pilih role yang boleh mengakses route ini
                                </p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={handleActiveChange}
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    Active (Aktifkan permission check untuk route ini)
                                </Label>
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