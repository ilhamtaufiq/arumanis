import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-stores';
import { getUser, updateUser } from '@/features/users/api';
import type { User } from '@/features/users/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Save, User as UserIcon, Mail, IdCard, Briefcase, Shield } from 'lucide-react';

export default function ProfilePage() {
    const { auth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [userData, setUserData] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        nip: '',
        jabatan: '',
        password: '',
    });

    useEffect(() => {
        const fetchUserData = async () => {
            if (!auth.user?.id) return;
            try {
                setIsLoading(true);
                const data = await getUser(auth.user.id);
                setUserData(data);
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    nip: data.nip || '',
                    jabatan: data.jabatan || '',
                    password: '',
                });
            } catch (error) {
                console.error('Failed to fetch user:', error);
                toast.error('Gagal memuat data profil');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, [auth.user?.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.user?.id) return;

        try {
            setIsSaving(true);
            const { password, ...rest } = formData;
            const payload = password ? formData : rest;

            await updateUser({ id: auth.user.id, data: payload });

            // Update auth store with new data
            if (auth.user) {
                auth.setUser({
                    ...auth.user,
                    name: formData.name,
                    email: formData.email,
                });
            }

            toast.success('Profil berhasil diperbarui');
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Gagal menyimpan profil');
        } finally {
            setIsSaving(false);
        }
    };

    const initials = (auth.user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase();

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <p className="text-muted-foreground">Memuat profil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center space-x-4">
                <UserIcon className="h-8 w-8" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profil Saya</h1>
                    <p className="text-muted-foreground">Kelola informasi profil akun Anda</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Card */}
                <Card className="md:col-span-1">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={userData?.avatar} alt={userData?.name} />
                                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                            </Avatar>
                        </div>
                        <CardTitle>{userData?.name}</CardTitle>
                        <CardDescription>{userData?.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {userData?.nip && (
                            <div className="flex items-center gap-2 text-sm">
                                <IdCard className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">NIP:</span>
                                <span>{userData.nip}</span>
                            </div>
                        )}
                        {userData?.jabatan && (
                            <div className="flex items-center gap-2 text-sm">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Jabatan:</span>
                                <span>{userData.jabatan}</span>
                            </div>
                        )}
                        <div className="pt-2">
                            <div className="flex items-center gap-2 text-sm mb-2">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Roles:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {userData?.roles?.map((role) => (
                                    <Badge key={role.id} variant="secondary">
                                        {role.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Form */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Edit Profil</CardTitle>
                        <CardDescription>Perbarui informasi profil Anda</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="flex items-center gap-2">
                                    <UserIcon className="h-4 w-4" />
                                    Nama Lengkap
                                </Label>
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
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nip" className="flex items-center gap-2">
                                        <IdCard className="h-4 w-4" />
                                        NIP
                                    </Label>
                                    <Input
                                        id="nip"
                                        name="nip"
                                        value={formData.nip}
                                        onChange={handleChange}
                                        placeholder="Nomor Induk Pegawai"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jabatan" className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        Jabatan
                                    </Label>
                                    <Input
                                        id="jabatan"
                                        name="jabatan"
                                        value={formData.jabatan}
                                        onChange={handleChange}
                                        placeholder="Jabatan"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Password Baru (kosongkan jika tidak ingin mengubah)
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password baru"
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={isSaving}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
