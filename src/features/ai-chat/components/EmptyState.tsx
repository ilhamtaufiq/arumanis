import { ArrowUpRight, FileText, HardDrive, MapPin, TrendingUp, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SARAN = [
    { icon: Wallet, teks: 'Berapa pekerjaan yang sudah berkontrak?' },
    { icon: TrendingUp, teks: 'Pekerjaan apa saja yang progresnya rendah?' },
    { icon: MapPin, teks: 'Desa mana yang paling banyak pagunya?' },
    { icon: HardDrive, teks: 'Berapa SP2D terbaru dan nilainya?' },
    { icon: FileText, teks: 'Cari surat tentang sanitasi' },
]

interface EmptyStateProps {
    tahun: string
    onPilih: (teks: string) => void
}

/** Tampilan saat chat belum dimulai. Berisi contoh pertanyaan yang sesuai dengan tool yang tersedia. */
export function EmptyState({ tahun, onPilih }: EmptyStateProps) {
    return (
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-6 text-center">
            <img
                src="/animations/driplet/driplet-poster.png"
                alt=""
                width={112}
                height={121}
                className="h-auto w-28 select-none"
                draggable={false}
            />
            <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight">Mau tanya apa tentang data TA {tahun}?</h2>
                <p className="text-sm text-muted-foreground">
                    Jawaban diambil dari data Arumanis. Setiap jawaban menyebut sumbernya, supaya bisa diperiksa.
                </p>
            </div>
            <div className="grid w-full gap-2 sm:grid-cols-2">
                {SARAN.map(({ icon: Icon, teks }) => (
                    <Button
                        key={teks}
                        type="button"
                        variant="outline"
                        className="group h-auto justify-between gap-3 whitespace-normal rounded-xl px-4 py-3 text-left text-sm font-normal"
                        onClick={() => onPilih(teks)}
                    >
                        <span className="flex items-center gap-3">
                            <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                            {teks}
                        </span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                    </Button>
                ))}
            </div>
        </div>
    )
}
