import { useState, useEffect } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { createKegiatanRole } from '../api';
import { getRoles } from '@/features/roles/api';
import { getKegiatan } from '@/features/kegiatan/api/kegiatan';
import type { Role } from '@/features/roles/types';
import type { Kegiatan } from '@/features/kegiatan/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';
import { ArrowLeft, Save } from 'lucide-react';

export default function KegiatanRoleForm() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [kegiatans, setKegiatans] = useState<Kegiatan[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [loadingKegiatans, setLoadingKegiatans] = useState(true);

    const [formData, setFormData] = useState({
        role_id: '',
        kegiatan_id: '',
    });

    useEffect(() => {
        const fetchAllRoles = async () => {
            try {
                setLoadingRoles(true);
                const response = await getRoles({ page: 1 });
                if (response?.data && Array.isArray(response.data)) {
                    setRoles(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch roles:', error);
                toast.error('Gagal memuat data roles');
            } finally {
                setLoadingRoles(false);
            }
        };

        const fetchAllKegiatans = async () => {
            try {
                setLoadingKegiatans(true);
                const response = await getKegiatan({ page: 1 });
                if (response?.data && Array.isArray(response.data)) {
                    setKegiatans(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch kegiatans:', error);
                toast.error('Gagal memuat data kegiatan');
            } finally {
                setLoadingKegiatans(false);
            }
        };

        fetchAllRoles();
        fetchAllKegiatans();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.role_id || !formData.kegiatan_id) {
            toast.error('Silakan pilih role dan kegiatan');
            return;
        }

        try {
            setIsLoading(true);
            await createKegiatanRole({
                role_id: parseInt(formData.role_id),
                kegiatan_id: parseInt(formData.kegiatan_id),
            });
            toast.success('Kegiatan-role berhasil ditambahkan');
            navigate({ to: '/kegiatan-role' });
        } catch (error: any) {
            console.error('Failed to save kegiatan-role:', error);
            const errorMessage = error?.response?.data?.message || 'Gagal menyimpan kegiatan-role';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/kegiatan-role">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Tambah Kegiatan-Role Baru
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Kegiatan-Role</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="role_id">Role</Label>
                                <Select
                                    value={formData.role_id}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, role_id: value }))}
                                    disabled={loadingRoles}
                                >
                                    <SelectTrigger id="role_id">
                                        <SelectValue placeholder={loadingRoles ? "Memuat roles..." : "Pilih role"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.id.toString()}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="kegiatan_id">Kegiatan</Label>
                                <Select
                                    value={formData.kegiatan_id}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, kegiatan_id: value }))}
                                    disabled={loadingKegiatans}
                                >
                                    <SelectTrigger id="kegiatan_id">
                                        <SelectValue placeholder={loadingKegiatans ? "Memuat kegiatan..." : "Pilih kegiatan"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {kegiatans.map((kegiatan) => (
                                            <SelectItem key={kegiatan.id} value={kegiatan.id.toString()}>
                                                {kegiatan.nama_sub_kegiatan} ({kegiatan.tahun_anggaran})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate({ to: '/kegiatan-role' })}
                                    disabled={isLoading}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={isLoading || !formData.role_id || !formData.kegiatan_id}>
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
