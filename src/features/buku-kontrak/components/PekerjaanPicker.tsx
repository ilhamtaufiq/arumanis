import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'

export type PekerjaanTerpilih = { id: number; nama: string }

type Props = {
    value: PekerjaanTerpilih | null
    onChange: (value: PekerjaanTerpilih) => void
}

/** Jumlah hasil saat belum mencari, dan saat mencari. */
const JUMLAH_AWAL = 10
const JUMLAH_CARI = 50

/**
 * Pilih pekerjaan tujuan. Default menampilkan 10 pekerjaan aktif pada tahun anggaran terpilih.
 * Saat mengetik, pencarian dijalankan di server pada tahun yang sama.
 */
export function PekerjaanPicker({ value, onChange }: Props) {
    const { tahunAnggaran } = useAppSettingsValues()
    const tahunAktif = Number(tahunAnggaran) || new Date().getFullYear()
    const [tahun, setTahun] = useState(String(tahunAktif))
    const [ketikan, setKetikan] = useState('')
    const [cari, setCari] = useState('')

    // Tahun ikut pengaturan aplikasi begitu sudah termuat.
    useEffect(() => {
        setTahun(String(tahunAktif))
    }, [tahunAktif])

    // Tunda pencarian sebentar agar tidak mengirim permintaan setiap ketukan.
    useEffect(() => {
        const t = setTimeout(() => setCari(ketikan.trim()), 300)
        return () => clearTimeout(t)
    }, [ketikan])

    const daftarTahun = useMemo(() => {
        const dasar = tahunAktif
        return [dasar + 1, dasar, dasar - 1, dasar - 2, dasar - 3].map(String)
    }, [tahunAktif])

    const { data: hasil = [], isFetching } = useQuery({
        queryKey: ['buku-kontrak', 'pekerjaan-cari', tahun, cari],
        queryFn: async () =>
            (
                await getPekerjaan({
                    tahun,
                    search: cari || undefined,
                    per_page: cari ? JUMLAH_CARI : JUMLAH_AWAL,
                    status: 'active',
                })
            ).data,
    })

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
                <select
                    value={tahun}
                    onChange={(e) => setTahun(e.target.value)}
                    className="h-9 rounded-md border bg-background px-3 text-sm sm:w-32"
                    aria-label="Tahun anggaran"
                >
                    {daftarTahun.map((t) => (
                        <option key={t} value={t}>
                            TA {t}
                        </option>
                    ))}
                </select>
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Cari nama paket atau kode rekening..."
                        value={ketikan}
                        onChange={(e) => setKetikan(e.target.value)}
                    />
                </div>
            </div>

            {value ? (
                <p className="text-sm">
                    Dipilih: <span className="font-medium">{value.nama}</span>
                </p>
            ) : null}

            <div className="max-h-64 overflow-y-auto rounded-md border">
                {isFetching ? (
                    <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Memuat pekerjaan...
                    </div>
                ) : hasil.length === 0 ? (
                    <p className="p-3 text-sm text-muted-foreground">
                        {cari ? 'Tidak ada pekerjaan yang cocok pada tahun ini.' : 'Belum ada pekerjaan aktif pada tahun ini.'}
                    </p>
                ) : (
                    hasil.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => onChange({ id: p.id, nama: p.nama_paket })}
                            className={`block w-full border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-muted ${value?.id === p.id ? 'bg-muted font-medium' : ''}`}
                        >
                            <span className="block break-words">{p.nama_paket}</span>
                            {p.kode_rekening ? (
                                <span className="block text-xs text-muted-foreground">{p.kode_rekening}</span>
                            ) : null}
                        </button>
                    ))
                )}
            </div>
            {!cari && hasil.length >= JUMLAH_AWAL ? (
                <p className="text-xs text-muted-foreground">
                    Menampilkan {JUMLAH_AWAL} pekerjaan pertama. Ketik untuk mencari di semua pekerjaan TA {tahun}.
                </p>
            ) : null}
        </div>
    )
}
