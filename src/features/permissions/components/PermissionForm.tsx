import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from '@tanstack/react-router';
import { createPermission, getPermission, updatePermission } from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';
import { ArrowLeft, Save } from 'lucide-react';

export default function PermissionForm() {
    const params = useParams({ strict: false });
    const id = params.id;
    const navigate = useNavigate();
    const isEdit = !!id;
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
    });

    useEffect(() => {
        if (isEdit && id) {
            const fetchData = async () => {
                try {
                    const data = await getPermission(parseInt(id));
                    setFormData({
                        name: data.name,
                    });
                } catch (error) {
                    console.error('Failed to fetch permission:', error);
                    toast.error('Gagal memuat data permission');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            if (isEdit && id) {
                await updatePermission({ id: parseInt(id), data: formData });
                toast.success('Permission berhasil diperbarui');
            } else {
                await createPermission(formData);
                toast.success('Permission berhasil ditambahkan');
            }
            navigate({ to: '/settings' });
        } catch (error) {
            console.error('Failed to save permission:', error);
            toast.error('Gagal menyimpan permission');
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
                        {isEdit ? 'Edit Permission' : 'Tambah Permission Baru'}
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Permission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Permission</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nama permission"
                                    required
                                />
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
