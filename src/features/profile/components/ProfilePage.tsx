import { useState, useEffect, useMemo, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-stores'
import { updateMyProfile, uploadMyAvatar, deleteMyAvatar } from '@/features/users/api'
import type { UserFormData } from '@/features/users/types'
import { useUserDetail, userKeys } from '@/features/users/hooks/useUsers'
import { useAuditLogsList } from '@/features/audit-logs/hooks/useAuditLogs'
import type { AuditLog } from '@/features/audit-logs/types'
import type { User } from '@/features/users/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    Save,
    User as UserIcon,
    Mail,
    IdCard,
    Briefcase,
    CalendarDays,
    Eye,
    EyeOff,
    History,
    KeyRound,
    Shield,
    Trash2,
    Upload,
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
    const [showPassword, setShowPassword] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const avatarInputRef = useRef<HTMLInputElement | null>(null)
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

    // Aktivitas user (audit log) — endpoint existing, filter user_id.
    const { data: activityRes, isLoading: activityLoading } = useAuditLogsList(
        { user_id: auth.user?.id ?? 0, per_page: 15 },
        !!auth.user?.id,
    )

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

    const passwordStrength = useMemo(() => {
        const pw = formData.password
        if (!pw) return null
        let score = 0
        if (pw.length >= 8) score++
        if (pw.length >= 12) score++
        if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
        if (/\d/.test(pw)) score++
        if (/[^a-zA-Z0-9]/.test(pw)) score++
        const levels = [
            { label: 'Lemah', tone: 'bg-red-500', max: 2 },
            { label: 'Sedang', tone: 'bg-amber-500', max: 4 },
            { label: 'Kuat', tone: 'bg-emerald-500', max: 5 },
        ] as const
        const level = score <= 2 ? levels[0] : score <= 4 ? levels[1] : levels[2]
        return { score, ...level }
    }, [formData.password])

    const passwordMismatch = Boolean(formData.password) && confirmPassword !== formData.password
    const passwordTooShort = Boolean(formData.password) && formData.password.length < 6

    const activity = activityRes?.data ?? []
    const permissionNames = useMemo(() => {
        const perms = userData?.permissions ?? []
        return perms.map((p) => p.name).sort()
    }, [userData?.permissions])

    const activeGender = formData.gender || userData?.gender || null
    const genderLabel = formatUserGenderLabel(activeGender)
    const storedAvatar = userData?.avatar ?? null
    const uploadedAvatar = userData?.avatar_url ?? null
    // Avatar upload (file) menang atas dicebear URL.
    const displayAvatar =
        uploadedAvatar ??
        (storedAvatar && isDicebearAvatarUrl(storedAvatar)
            ? updateDicebearAvatarGender(storedAvatar, activeGender)
            : storedAvatar)
    const hasCustomAvatar = Boolean(storedAvatar?.trim())
    const hasUploadedAvatarFile = Boolean(uploadedAvatar)

    const syncAuthUser = (patch: Partial<User>) => {
        if (!auth.user) return
        auth.setUser({
            ...auth.user,
            name: patch.name ?? auth.user.name,
            email: patch.email ?? auth.user.email,
            gender: patch.gender !== undefined ? patch.gender : auth.user.gender,
            avatar: patch.avatar !== undefined ? patch.avatar : auth.user.avatar,
        } as User)
    }

    const persistAvatar = async (avatar: string | null) => {
        if (!auth.user?.id) return

        try {
            setIsAvatarUpdating(true)
            const updated = await updateMyProfile({
                name: userData?.name ?? auth.user.name,
                email: userData?.email ?? auth.user.email,
                avatar,
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

    const handleUploadAvatarFile = async (file: File | null) => {
        if (!file) return
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ukuran file maksimal 5 MB')
            return
        }
        if (!file.type.startsWith('image/')) {
            toast.error('File harus berupa gambar (JPG/PNG/WEBP/GIF)')
            return
        }

        try {
            setIsUploadingAvatar(true)
            const updated = await uploadMyAvatar(file)
            setUserData(updated)
            // avatar_url di-set; kolom avatar (dicebear) tidak diubah.
            await queryClient.invalidateQueries({ queryKey: userKeys.detail(auth.user.id) })
            toast.success('Avatar berhasil diunggah')
        } catch (error) {
            console.error('Failed to upload avatar:', error)
            toast.error('Gagal mengunggah avatar')
        } finally {
            setIsUploadingAvatar(false)
            if (avatarInputRef.current) avatarInputRef.current.value = ''
        }
    }

    const handleRemoveUploadedAvatar = async () => {
        try {
            setIsUploadingAvatar(true)
            const updated = await deleteMyAvatar()
            setUserData(updated)
            await queryClient.invalidateQueries({ queryKey: userKeys.detail(auth.user.id) })
            toast.success('Avatar upload dihapus')
        } catch (error) {
            console.error('Failed to delete avatar:', error)
            toast.error('Gagal menghapus avatar')
        } finally {
            setIsUploadingAvatar(false)
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
        if (passwordTooShort) {
            toast.error('Password minimal 6 karakter')
            return
        }
        if (passwordMismatch) {
            toast.error('Konfirmasi password tidak cocok')
            return
        }

        try {
            setIsSaving(true)
            const { password, ...rest } = formData
            const nextGender = formData.gender || null
            let nextAvatar = userData?.avatar ?? null
            if (nextAvatar && isDicebearAvatarUrl(nextAvatar)) {
                nextAvatar = updateDicebearAvatarGender(nextAvatar, nextGender)
            }

            const payload: Partial<UserFormData> = {
                ...rest,
                gender: nextGender,
                ...(nextAvatar !== userData?.avatar ? { avatar: nextAvatar } : {}),
                ...(password ? { password } : {}),
            }

            // PUT /auth/profile — self-service, tidak butuh role admin.
            const updated = await updateMyProfile(payload)

            setUserData(updated)
            syncAuthUser({
                name: formData.name,
                email: formData.email,
                gender: nextGender,
                avatar: updated.avatar ?? null,
            })

            await queryClient.invalidateQueries({ queryKey: userKeys.detail(auth.user.id) })

            setFormData((prev) => ({ ...prev, password: '' }))
            setConfirmPassword('')
            setShowPassword(false)
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

    const formatEvent = (log: AuditLog) => {
        const type = log.auditable_type.split('\\').pop() ?? log.auditable_type
        const eventLabel = log.event === 'created' ? 'dibuat' : log.event === 'updated' ? 'diperbarui' : 'dihapus'
        return `${type} ${eventLabel}`
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
                                avatarUrl={displayAvatar}
                                gender={activeGender}
                                name={formData.name || userData?.name}
                                email={formData.email || userData?.email}
                                id={userData?.id}
                            />
                        </div>
                        <CardTitle>{formData.name || userData?.name}</CardTitle>
                        <CardDescription>{formData.email || userData?.email}</CardDescription>
                        <div className="flex flex-col gap-2 pt-2">
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={(e) => void handleUploadAvatarFile(e.target.files?.[0] ?? null)}
                            />
                            <Button
                                type="button"
                                className="w-full"
                                onClick={() => avatarInputRef.current?.click()}
                                disabled={isUploadingAvatar || isAvatarUpdating || isSaving}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                {isUploadingAvatar ? 'Mengunggah...' : 'Unggah foto'}
                            </Button>
                            {hasUploadedAvatarFile ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleRemoveUploadedAvatar}
                                    disabled={isUploadingAvatar || isSaving}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus foto upload
                                </Button>
                            ) : null}
                            <Button
                                type="button"
                                variant="outline"
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
                        {userData?.created_at ? (
                            <div className="flex items-center gap-2 border-t pt-3 text-sm">
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Anggota sejak</span>
                                <span className="ml-auto font-medium">
                                    {new Date(userData.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                        ) : null}
                        {permissionNames.length > 0 ? (
                            <div className="border-t pt-3">
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <KeyRound className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Izin</span>
                                    </div>
                                    <Badge variant="outline" className="text-[10px]">{permissionNames.length}</Badge>
                                </div>
                                <div className="flex max-h-40 flex-wrap gap-1 overflow-y-auto">
                                    {permissionNames.map((name) => (
                                        <Badge key={name} variant="outline" className="text-[10px] font-normal">
                                            {name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                <div className="md:col-span-2">
                    <Tabs defaultValue="profil">
                        <TabsList>
                            <TabsTrigger value="profil">Profil</TabsTrigger>
                            <TabsTrigger value="aktivitas">Aktivitas</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profil">
                <Card>
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
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Password baru"
                                            className="pr-10"
                                            aria-invalid={passwordTooShort || passwordMismatch}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            onClick={() => setShowPassword((v) => !v)}
                                            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {passwordStrength ? (
                                        <div className="space-y-1">
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((i) => (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            'h-1.5 flex-1 rounded-full',
                                                            i <= passwordStrength.score ? passwordStrength.tone : 'bg-muted',
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Kekuatan: {passwordStrength.label}</p>
                                        </div>
                                    ) : null}
                                    {passwordTooShort ? (
                                        <p className="text-xs text-destructive">Password minimal 6 karakter</p>
                                    ) : null}
                                    {Boolean(formData.password) ? (
                                        <div className="space-y-2 pt-1">
                                            <Label htmlFor="confirm-password">Konfirmasi password baru</Label>
                                            <Input
                                                id="confirm-password"
                                                name="confirmPassword"
                                                type={showPassword ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Ulangi password baru"
                                                aria-invalid={passwordMismatch}
                                            />
                                            {passwordMismatch ? (
                                                <p className="text-xs text-destructive">Konfirmasi password tidak cocok</p>
                                            ) : null}
                                        </div>
                                    ) : null}
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
                        </TabsContent>

                        <TabsContent value="aktivitas">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <History className="h-4 w-4 text-primary" />
                                        Aktivitas Terakhir
                                    </CardTitle>
                                    <CardDescription>15 aksi terakhir Anda di sistem</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {activityLoading ? (
                                        <div className="space-y-3">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Skeleton key={i} className="h-12 w-full" />
                                            ))}
                                        </div>
                                    ) : activity.length === 0 ? (
                                        <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                                            Belum ada aktivitas tercatat
                                        </div>
                                    ) : (
                                        <ol className="relative space-y-4 border-l pl-5">
                                            {activity.map((log) => (
                                                <li key={log.id} className="relative">
                                                    <span className="absolute -left-[26px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-background bg-primary/60" />
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                'text-[10px]',
                                                                log.event === 'created' && 'border-emerald-300 text-emerald-700',
                                                                log.event === 'updated' && 'border-blue-300 text-blue-700',
                                                                log.event === 'deleted' && 'border-red-300 text-red-700',
                                                            )}
                                                        >
                                                            {log.event}
                                                        </Badge>
                                                        <span className="text-sm font-medium">{formatEvent(log)}</span>
                                                        <span className="ml-auto text-xs text-muted-foreground">
                                                            {new Date(log.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    {log.ip_address ? (
                                                        <p className="mt-0.5 text-xs text-muted-foreground">IP {log.ip_address}</p>
                                                    ) : null}
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}