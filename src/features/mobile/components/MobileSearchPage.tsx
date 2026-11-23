import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { sidebarData } from '@/components/layout/data/sidebar-data'
import type { NavGroup } from '@/components/layout/type'
import { canViewAdvancedMvpFeatures } from '@/lib/mvp-access'
import { filterSidebarNavGroups } from '@/lib/sidebar-nav'
import { useAuthStore } from '@/stores/auth-stores'
import { useMenuPermissionStore } from '@/stores/menu-permission-store'
import { cariData, type HasilData } from '../api/cari-data'
import { cariModul, pecahKueri } from '../lib/cari-modul'

/** Minimal kata sebelum pencarian data dikirim ke server. */
const MIN_KATA_DATA = 3

function useDebounced<T>(nilai: T, ms: number): T {
    const [tertunda, setTertunda] = useState(nilai)
    useEffect(() => {
        const t = setTimeout(() => setTertunda(nilai), ms)
        return () => clearTimeout(t)
    }, [nilai, ms])
    return tertunda
}

function Bagian({ judul, children }: { judul: string; children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-2">
            <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{judul}</h2>
            <ul className="divide-y rounded-xl border bg-background">{children}</ul>
        </section>
    )
}

/**
 * Beranda mobile: kolom pencarian saja. Hasil berupa modul (dari menu yang boleh diakses) dan data
 * (paket, unit SPAM, desa) dari endpoint yang sudah ada; endpoint itu tetap memeriksa izin sendiri.
 */
export function MobileSearchPage() {
    const [kueri, setKueri] = useState('')
    const kueriTertunda = useDebounced(kueri, 300)
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

    const menu: NavGroup[] = useMemo(() => {
        if (!isLoaded) return []
        return filterSidebarNavGroups(sidebarData.navGroups, {
            canAccessMenu,
            showAdvancedFeatures: canViewAdvancedMvpFeatures(user?.roles),
        })
    }, [isLoaded, canAccessMenu, user?.roles])

    const kataData = pecahKueri(kueriTertunda).join(' ')
    const modul = cariModul(menu, kueri)
    const data = useQuery({
        queryKey: ['mobile-cari-data', kataData],
        queryFn: () => cariData(kataData),
        enabled: kataData.length >= MIN_KATA_DATA,
        staleTime: 30_000,
    })

    const adaHasil =
        modul.length > 0 ||
        (data.data && (data.data.pekerjaan.length + data.data.unit.length + data.data.desa.length) > 0)

    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pb-8 pt-6">
            <label className="relative block">
                <span className="sr-only">Cari modul atau data</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                    type="search"
                    autoFocus
                    autoComplete="off"
                    enterKeyHint="search"
                    value={kueri}
                    onChange={(e) => setKueri(e.target.value)}
                    placeholder="Cari modul atau nama paket, desa, unit"
                    className="h-12 w-full rounded-full border bg-background pl-12 pr-4 text-base outline-none focus:ring-2 focus:ring-ring"
                />
            </label>

            {!isLoaded ? (
                <p className="text-center text-sm text-muted-foreground">Memuat menu…</p>
            ) : kueri.trim() === '' ? null : (
                <>
                    {modul.length > 0 && (
                        <Bagian judul="Modul">
                            {modul.map((m) => (
                                <li key={`${m.url}-${m.judul}`}>
                                    <Link to={m.url} className="flex flex-col gap-0.5 px-4 py-3 active:bg-muted">
                                        <span className="text-base font-medium">{m.judul}</span>
                                        <span className="text-xs text-muted-foreground">{m.grup}</span>
                                    </Link>
                                </li>
                            ))}
                        </Bagian>
                    )}

                    {data.isFetching && <p className="text-center text-sm text-muted-foreground">Mencari data…</p>}
                    {data.isError && (
                        <p className="text-center text-sm text-red-600">Pencarian data gagal. Coba lagi.</p>
                    )}

                    {data.data && data.data.pekerjaan.length > 0 && (
                        <Bagian judul="Paket pekerjaan">
                            {data.data.pekerjaan.map((h: HasilData) => (
                                <li key={`p-${h.id}`}>
                                    <Link to="/pekerjaan/$id" params={{ id: String(h.id) }} className="flex flex-col gap-0.5 px-4 py-3 active:bg-muted">
                                        <span className="text-base font-medium">{h.judul}</span>
                                        <span className="text-xs text-muted-foreground">{h.sub}</span>
                                    </Link>
                                </li>
                            ))}
                        </Bagian>
                    )}

                    {data.data && data.data.unit.length > 0 && (
                        <Bagian judul="Unit SPAM">
                            {data.data.unit.map((h: HasilData) => (
                                <li key={`u-${h.id}`}>
                                    <Link to="/spam-unit" search={{ q: h.judul }} className="flex flex-col gap-0.5 px-4 py-3 active:bg-muted">
                                        <span className="text-base font-medium">{h.judul}</span>
                                        <span className="text-xs text-muted-foreground">{h.sub}</span>
                                    </Link>
                                </li>
                            ))}
                        </Bagian>
                    )}

                    {data.data && data.data.desa.length > 0 && (
                        <Bagian judul="Desa">
                            {data.data.desa.map((h: HasilData) => (
                                <li key={`d-${h.id}`}>
                                    <Link to="/desa/$id" params={{ id: String(h.id) }} className="flex flex-col gap-0.5 px-4 py-3 active:bg-muted">
                                        <span className="text-base font-medium">{h.judul}</span>
                                        <span className="text-xs text-muted-foreground">{h.sub}</span>
                                    </Link>
                                </li>
                            ))}
                        </Bagian>
                    )}

                    {!adaHasil && !data.isFetching && (
                        <p className="text-center text-sm text-muted-foreground">Tidak ada yang cocok.</p>
                    )}
                </>
            )}
        </main>
    )
}
