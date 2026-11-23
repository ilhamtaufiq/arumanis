import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { sidebarData } from '@/components/layout/data/sidebar-data'
import { canViewAdvancedMvpFeatures } from '@/lib/mvp-access'
import { filterSidebarNavGroups } from '@/lib/sidebar-nav'
import { useAuthStore } from '@/stores/auth-stores'
import { useMenuPermissionStore } from '@/stores/menu-permission-store'
import { cariModul } from '../lib/cari-modul'

/**
 * Beranda mobile: hanya kolom pencarian. Hasilnya daftar modul yang boleh diakses pengguna,
 * memakai aturan menu yang sama dengan sidebar web.
 */
export function MobileSearchPage() {
    const [kueri, setKueri] = useState('')
    const user = useAuthStore((s) => s.auth.user)
    const userId = user?.id
    const isLoaded = useMenuPermissionStore((s) => s.isLoaded)
    const canAccessMenu = useMenuPermissionStore((s) => s.canAccessMenu)
    const fetchMenuPermissions = useMenuPermissionStore((s) => s.fetchMenuPermissions)
    const setUserRoles = useMenuPermissionStore((s) => s.setUserRoles)

    // Sama seperti sidebar: peran diisi dulu agar bypass admin berlaku, lalu izin menu dimuat.
    const rolesKey = (user?.roles ?? [])
        .map((role: { name?: string } | string) => (typeof role === 'string' ? role : role.name))
        .join(',')
    useEffect(() => {
        if (!userId) return
        setUserRoles(rolesKey ? rolesKey.split(',').filter(Boolean) : [])
    }, [userId, rolesKey, setUserRoles])

    useEffect(() => {
        if (userId) void fetchMenuPermissions(userId)
    }, [userId, fetchMenuPermissions])

    const menu = useMemo(() => {
        if (!isLoaded) return []
        return filterSidebarNavGroups(sidebarData.navGroups, {
            canAccessMenu,
            showAdvancedFeatures: canViewAdvancedMvpFeatures(user?.roles),
        })
    }, [isLoaded, canAccessMenu, user?.roles])

    const hasil = cariModul(menu, kueri)

    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pb-8 pt-6">
            <label className="relative block">
                <span className="sr-only">Cari modul</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                    type="search"
                    autoFocus
                    autoComplete="off"
                    enterKeyHint="search"
                    value={kueri}
                    onChange={(e) => setKueri(e.target.value)}
                    placeholder="Cari modul, mis. pekerjaan"
                    className="h-12 w-full rounded-full border bg-background pl-12 pr-4 text-base outline-none focus:ring-2 focus:ring-ring"
                />
            </label>

            {!isLoaded ? (
                <p className="text-center text-sm text-muted-foreground">Memuat menu…</p>
            ) : kueri.trim() === '' ? null : hasil.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">Tidak ada modul yang cocok.</p>
            ) : (
                <ul className="divide-y rounded-xl border bg-background">
                    {hasil.map((m) => (
                        <li key={`${m.url}-${m.judul}`}>
                            <Link to={m.url} className="flex flex-col gap-0.5 px-4 py-3 active:bg-muted">
                                <span className="text-base font-medium">{m.judul}</span>
                                <span className="text-xs text-muted-foreground">{m.grup}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    )
}
