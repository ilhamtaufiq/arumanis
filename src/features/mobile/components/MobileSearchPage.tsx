import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { sidebarData } from '@/components/layout/data/sidebar-data'
import type { NavGroup } from '@/components/layout/type'
import { Skeleton } from '@/components/ui/skeleton'
import { canViewAdvancedMvpFeatures } from '@/lib/mvp-access'
import { filterSidebarNavGroups } from '@/lib/sidebar-nav'
import { useAuthStore } from '@/stores/auth-stores'
import { useMenuPermissionStore } from '@/stores/menu-permission-store'
import { cariData, type HasilData } from '../api/cari-data'
import { MobileBottomNav } from './MobileBottomNav'
import { cariModul, pecahKueri, type ModulHasil } from '../lib/cari-modul'
import { sorotPotongan } from '../lib/sorot'

/** Minimal kata sebelum pencarian data dikirim ke server. */
const MIN_KATA_DATA = 3

type Filter = 'semua' | 'modul' | 'paket' | 'unit' | 'desa'

const FILTER_LABEL: Record<Filter, string> = {
    semua: 'Semua',
    modul: 'Modul',
    paket: 'Paket',
    unit: 'Unit SPAM',
    desa: 'Desa',
}

const STATUS_LABEL: Record<string, string> = {
    active: 'Aktif',
    canceled: 'Dibatalkan',
}

function useDebounced<T>(nilai: T, ms: number): T {
    const [tertunda, setTertunda] = useState(nilai)
    useEffect(() => {
        const t = setTimeout(() => setTertunda(nilai), ms)
        return () => clearTimeout(t)
    }, [nilai, ms])
    return tertunda
}

function Judul({ teks, kueri }: { teks: string; kueri: string }) {
    return (
        <span className="text-base font-medium">
            {sorotPotongan(teks, kueri).map((p, i) =>
                p.cocok ? (
                    <mark key={i} className="bg-transparent font-semibold text-primary">{p.teks}</mark>
                ) : (
                    <span key={i}>{p.teks}</span>
                ),
            )}
        </span>
    )
}

function Bagian({ judul, jumlah, children }: { judul: string; jumlah: number; children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-2">
            <h2 className="flex items-center justify-between px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span>{judul}</span>
                <span className="tabular-nums">{jumlah}</span>
            </h2>
            <ul className="divide-y rounded-xl border bg-background">{children}</ul>
        </section>
    )
}

function Baris({ to, params, search, judul, sub, status, kueri }: {
    to: string
    params?: Record<string, string>
    search?: Record<string, string>
    judul: string
    sub: string
    status?: string
    kueri: string
}) {
    return (
        <li>
            <Link
                to={to as never}
                params={params as never}
                search={search as never}
                className="flex flex-col gap-1 px-4 py-3 active:bg-muted"
            >
                <Judul teks={judul} kueri={kueri} />
                <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{sub}</span>
                    {status ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-foreground">
                            {STATUS_LABEL[status] ?? status}
                        </span>
                    ) : null}
                </span>
            </Link>
        </li>
    )
}

function SkeletonBagian({ judul }: { judul: string }) {
    return (
        <Bagian judul={judul} jumlah={0}>
            {[0, 1].map((i) => (
                <li key={i} className="flex flex-col gap-2 px-4 py-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </li>
            ))}
        </Bagian>
    )
}

/**
 * Beranda mobile: kolom pencarian dengan filter. Hasil berupa modul (dari menu yang boleh diakses) dan data
 * (paket, unit SPAM, desa) dari endpoint yang sudah ada; endpoint itu tetap memeriksa izin sendiri.
 */
export function MobileSearchPage() {
    const [kueri, setKueri] = useState('')
    const [filter, setFilter] = useState<Filter>('semua')
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
    const adaKueri = kueri.trim() !== ''
    const modul: ModulHasil[] = adaKueri ? cariModul(menu, kueri) : []
    const data = useQuery({
        queryKey: ['mobile-cari-data', kataData],
        queryFn: () => cariData(kataData),
        enabled: kataData.length >= MIN_KATA_DATA,
        staleTime: 30_000,
    })
    const hasilData = data.data
    const jumlah = {
        modul: modul.length,
        paket: hasilData?.pekerjaan.length ?? 0,
        unit: hasilData?.unit.length ?? 0,
        desa: hasilData?.desa.length ?? 0,
    }
    const total = jumlah.modul + jumlah.paket + jumlah.unit + jumlah.desa
    const sedangMemuatData = data.isFetching && !hasilData
    const kurangKata = adaKueri && kataData.length < MIN_KATA_DATA

    const tampil = (f: Filter) => filter === 'semua' || filter === f

    const barisData = (items: HasilData[], to: string, paramKey?: (h: HasilData) => Record<string, string>, searchKey?: (h: HasilData) => Record<string, string>) =>
        items.map((h) => (
            <Baris
                key={`${to}-${h.id}`}
                to={to}
                params={paramKey?.(h)}
                search={searchKey?.(h)}
                judul={h.judul}
                sub={h.sub}
                status={h.status}
                kueri={kueri}
            />
        ))

    return (
        <>
        <main
            className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4"
            style={{
                paddingTop: 'calc(1.5rem + env(safe-area-inset-top))',
                paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))',
            }}
        >
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
            ) : !adaKueri ? null : (
                <>
                    {kurangKata && (
                        <p className="px-1 text-xs text-muted-foreground">
                            Ketik minimal {MIN_KATA_DATA} huruf untuk mencari paket, unit, dan desa.
                        </p>
                    )}

                    <div role="tablist" aria-label="Filter hasil" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
                        {(Object.keys(FILTER_LABEL) as Filter[]).map((f) => {
                            const n = f === 'semua' ? total : jumlah[f]
                            const aktif = filter === f
                            return (
                                <button
                                    key={f}
                                    type="button"
                                    role="tab"
                                    aria-selected={aktif}
                                    onClick={() => setFilter(f)}
                                    className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${aktif ? 'border-primary bg-primary text-primary-foreground' : 'bg-background'}`}
                                >
                                    {FILTER_LABEL[f]} <span className="tabular-nums opacity-80">{n}</span>
                                </button>
                            )
                        })}
                    </div>

                    <p className="sr-only" aria-live="polite">{total} hasil</p>

                    {tampil('modul') && modul.length > 0 && (
                        <Bagian judul="Modul" jumlah={modul.length}>
                            {modul.map((m) => (
                                <Baris key={`${m.url}-${m.judul}`} to={m.url} judul={m.judul} sub={m.grup} kueri={kueri} />
                            ))}
                        </Bagian>
                    )}

                    {sedangMemuatData && (
                        <>
                            {tampil('paket') && <SkeletonBagian judul="Paket pekerjaan" />}
                            {tampil('unit') && <SkeletonBagian judul="Unit SPAM" />}
                            {tampil('desa') && <SkeletonBagian judul="Desa" />}
                        </>
                    )}

                    {data.isError && (
                        <div className="flex flex-col items-center gap-2 rounded-xl border bg-background p-4 text-center">
                            <p className="text-sm text-red-600">Pencarian data gagal.</p>
                            <button type="button" onClick={() => void data.refetch()} className="rounded-full border px-4 py-1.5 text-sm">
                                Coba lagi
                            </button>
                        </div>
                    )}

                    {hasilData && tampil('paket') && hasilData.pekerjaan.length > 0 && (
                        <Bagian judul="Paket pekerjaan" jumlah={hasilData.pekerjaan.length}>
                            {barisData(hasilData.pekerjaan, '/pekerjaan/$id', (h) => ({ id: String(h.id) }))}
                        </Bagian>
                    )}

                    {hasilData && tampil('unit') && hasilData.unit.length > 0 && (
                        <Bagian judul="Unit SPAM" jumlah={hasilData.unit.length}>
                            {barisData(hasilData.unit, '/spam-unit', undefined, (h) => ({ q: h.judul }))}
                        </Bagian>
                    )}

                    {hasilData && tampil('desa') && hasilData.desa.length > 0 && (
                        <Bagian judul="Desa" jumlah={hasilData.desa.length}>
                            {barisData(hasilData.desa, '/desa/$id', (h) => ({ id: String(h.id) }))}
                        </Bagian>
                    )}

                    {!sedangMemuatData && !data.isError && total === 0 && !kurangKata && (
                        <div className="rounded-xl border border-dashed p-6 text-center">
                            <p className="font-medium">Tidak ada yang cocok dengan “{kueri.trim()}”.</p>
                            <p className="mt-1 text-sm text-muted-foreground">Periksa ejaan atau coba kata yang lebih umum.</p>
                        </div>
                    )}
                </>
            )}
        </main>
            <MobileBottomNav />
        </>
    )
}
