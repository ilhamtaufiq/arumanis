import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-stores'
import { updateUser } from '@/features/users/api'
import { useUserDetail, userKeys } from '@/features/users/hooks/useUsers'
import type { User } from '@/features/users/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
    Save,
    User as UserIcon,
    Mail,
    IdCard,
    Briefcase,
    Shield,
    Users,
    Shuffle,
    RotateCcw,
} from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { UserGender } from '@/features/users/types'
import {
    createRandomDicebearAvatarUrl,
    formatUserGenderLabel,
    isDicebearAvatarUrl,
    updateDicebearAvatarGender,
} from '@/lib/user-avatar'

export default function ProfilePage() {
    const queryClient = useQueryClient()
    const { auth } = useAuthStore()
    const [isSaving, setIsSaving] = useState(false)
    const [isAvatarUpdating, setIsAvatarUpdating] = useState(false)
    const [userData, setUserData] = useState<User | null>(null)
    const { data: fetchedUser, isLoading } = useUserDetail(auth.user?.id ?? 0, !!auth.user?.id)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        nip: '',
        jabatan: '',
        gender: '' as UserGender | '',
        password: '',
    })

    useEffect(() => {
        if (!fetchedUser) return
        setUserData(fetchedUser)
        setFormData({
            name: fetchedUser.name || '',
            email: fetchedUser.email || '',
            nip: fetchedUser.nip || '',
            jabatan: fetchedUser.jabatan || '',
            gender: fetchedUser.gender || '',
            password: '',
        })
    }, [fetchedUser])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const activeGender = formData.gender || userData?.gender || null
    const genderLabel = formatUserGenderLabel(activeGender)
    const storedAvatar = userData?.avatar ?? null
    const displayAvatar =
        storedAvatar && isDicebearAvatarUrl(storedAvatar)
            ? updateDicebearAvatarGender(storedAvatar, activeGender)
            : storedAvatar
    const hasCustomAvatar = Boolean(storedAvatar?.trim())

    const syncAuthUser = (patch: Partial<User>) => {
        if (!auth.user) return
        auth.setUser({
            ...auth.user,
            name: patch.name ?? auth.user.name,
            email: patch.email ?? auth.user.email,
            gender: patch.gender !== undefined ? patch.gender : auth.user.gender,
            avatar: patch.avatar !== undefined ? patch.avatar : auth.user.avatar,
        })
    }

    const persistAvatar = async (avatar: string | null) => {
        if (!auth.user?.id) return

        try {
            setIsAvatarUpdating(true)
            const updated = await updateUser({
                id: auth.user.id,
                data: {
                    name: userData?.name ?? auth.user.name,
                    email: userData?.email ?? auth.user.email,
                    avatar,
                },
            })
            setUserData(updated)
            syncAuthUser({ avatar: updated.avatar ?? null })
            await queryClient.invalidateQueries({ queryKey: userKeys.detail(auth.user.id) })
        } catch (error) {
            console.error('Failed to update avatar:', error)
            toast.error('Gagal memperbarui avatar')
            throw error
        } finally {
            setIsAvatarUpdating(false)
        }
    }

    const handleRandomAvatar = async () => {
        const nextAvatar = createRandomDicebearAvatarUrl(activeGender)
        try {
            await persistAvatar(nextAvatar)
            toast.success('Avatar baru diterapkan')
        } catch {
            // toast handled in persistAvatar
        }
    }

    const handleResetAvatar = async () => {
        try {
            await persistAvatar(null)
            toast.success('Avatar dikembalikan ke default')
        } catch {
            // toast handled in persistAvatar
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!auth.user?.id) return

        try {
            setIsSaving(true)
            const { password, ...rest } = formData
            const nextGender = formData.gender || null
            let nextAvatar = userData?.avatar ?? null
            if (nextAvatar && isDicebearAvatarUrl(nextAvatar)) {
                nextAvatar = updateDicebearAvatarGender(nextAvatar, nextGender)
            }

            const payload = {
                ...(password ? formData : rest),
                gender: nextGender,
                ...(nextAvatar !== userData?.avatar ? { avatar: nextAvatar } : {}),
            }

            const updated = await updateUser({ id: auth.user.id, data: payload })

            setUserData(updated)
            syncAuthUser({
                name: formData.name,
                email: formData.email,
                gender: nextGender,
                avatar: updated.avatar ?? null,
            })

            await queryClient.invalidateQueries({ queryKey: userKeys.detail(auth.user.id) })

            toast.success('Profil berhasil diperbarui')
        } catch (error) {
            console.error('Failed to update profile:', error)
            toast.error('Gagal menyimpan profil')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex min-h-[400px] items-center justify-center">
                    <p className="text-muted-foreground">Memuat profil...</p>
                </div>
            </div>
        )
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
                <Card className="md:col-span-1">
                    <CardHeader className="text-center">
                        <div className="mb-4 flex justify-center">
                            <UserAvatar
                                className="h-24 w-24"
                                fallbackClassName="text-2xl"
                                avatar={displayAvatar}
                                gender={activeGender}
                                name={formData.name || userData?.name}
                                email={formData.email || userData?.email}
                                id={userData?.id}
                            />
                        </div>
                        <CardTitle>{formData.name || userData?.name}</CardTitle>
                        <CardDescription>{formData.email || userData?.email}</CardDescription>
                        <div className="flex flex-col gap-2 pt-2">
                            <Button
                                type="button"
                                className="w-full"
                                onClick={handleRandomAvatar}
                                disabled={isAvatarUpdating || isSaving}
                            >
                                <Shuffle className="mr-2 h-4 w-4" />
                                {isAvatarUpdating ? 'Mengacak...' : 'Acak avatar'}
                            </Button>
                            {hasCustomAvatar ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleResetAvatar}
                                    disabled={isAvatarUpdating || isSaving}
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Avatar default
                                </Button>
                            ) : null}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Jenis kelamin</span>
                            </div>
                            <Badge variant={activeGender ? 'secondary' : 'outline'}>{genderLabel}</Badge>
                        </div>

                        {userData?.nip ? (
                            <div className="flex items-center gap-2 text-sm">
                                <IdCard className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">NIP:</span>
                                <span>{userData.nip}</span>
                            </div>
                        ) : null}
                        {userData?.jabatan ? (
                            <div className="flex items-center gap-2 text-sm">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Jabatan:</span>
                                <span>{userData.jabatan}</span>
                            </div>
                        ) : null}
                        <div className="pt-2">
                            <div className="mb-2 flex items-center gap-2 text-sm">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Peran</span>
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

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Edit Profil</CardTitle>
                        <CardDescription>Perbarui informasi profil Anda</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                                <div>
                                    <h3 className="text-sm font-semibold">Avatar & identitas</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Gunakan avatar acak DiceBear atau biarkan sistem membuat avatar default
                                        dari ID akun. Jenis kelamin memengaruhi tampilan avatar DiceBear.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gender" className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Jenis kelamin
                                    </Label>
                                    <Select
                                        value={formData.gender || 'unset'}
                                        onValueChange={(value) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                gender: value === 'unset' ? '' : (value as UserGender),
                                            }))
                                        }
                                    >
                                        <SelectTrigger id="gender">
                                            <SelectValue placeholder="Pilih jenis kelamin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unset">Belum diisi</SelectItem>
                                            <SelectItem value="male">Laki-laki</SelectItem>
                                            <SelectItem value="female">Perempuan</SelectItem>
                                            <SelectItem value="other">Lainnya</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="flex items-center gap-2">
                                        <UserIcon className="h-4 w-4" />
                                        Nama lengkap
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

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                        Password baru (kosongkan jika tidak ingin mengubah)
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
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button type="submit" disabled={isSaving}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isSaving ? 'Menyimpan...' : 'Simpan perubahan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}