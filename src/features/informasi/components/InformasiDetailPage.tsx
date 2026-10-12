import { Link } from '@tanstack/react-router'
import { ArrowLeft, CalendarRange, Clock, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PublikasiContent } from '@/features/publikasi/components/PublikasiContent'
import { useInformasiDetail } from '../hooks/useInformasi'
import {
    isiToHtml,
    kategoriInfo,
    rentangTampil,
    STATUS_LABEL,
    STATUS_TONE,
    statusTampil,
} from '../lib/informasi-helpers'

const tanggalWaktuFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

interface InformasiDetailPageProps {
    id: number
}

/** Tampilan artikel mengikuti halaman publikasi: judul besar, meta tanggal, lalu isi dengan PublikasiContent. */
export function InformasiDetailPage({ id }: InformasiDetailPageProps) {
    const { data, isLoading, isError } = useInformasiDetail(id)

    if (isLoading) {
        return (
            <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    if (isError || !data) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                <h2 className="text-2xl font-semibold tracking-tight">Informasi tidak ditemukan</h2>
                <p className="max-w-md text-sm text-muted-foreground">Informasi mungkin telah dihapus, atau belum tampil untuk Anda.</p>
                <Button asChild variant="outline" className="rounded-full">
                    <Link to="/informasi">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke daftar informasi
                    </Link>
                </Button>
            </div>
        )
    }

    const item = data.data
    const info = kategoriInfo(item.kategori)
    const status = statusTampil(item, data.today)
    const rentang = rentangTampil(item)
    const dibuat = item.created_at ? tanggalWaktuFormatter.format(new Date(item.created_at)) : null

    return (
        <article className="mx-auto w-full max-w-3xl space-y-8 p-4 md:p-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between gap-3">
                <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link to="/informasi">
                        <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                        Kembali ke daftar informasi
                    </Link>
                </Button>
                {data.is_admin && (
                    <Button asChild size="sm" className="rounded-full">
                        <Link to="/informasi/$id/edit" params={{ id: String(item.id) }}>
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            Ubah
                        </Link>
                    </Button>
                )}
            </div>

            <header className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge className={info.tone}>{info.label}</Badge>
                    {data.is_admin && (
                        <Badge variant="outline" className={STATUS_TONE[status]}>
                            {STATUS_LABEL[status]}
                        </Badge>
                    )}
                </div>

                <h1 className="font-display text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl">
                    {item.judul}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {dibuat && (
                        <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-4 w-4" aria-hidden />
                            {dibuat}
                        </span>
                    )}
                    {rentang && (
                        <span className="inline-flex items-center gap-1.5">
                            <CalendarRange className="h-4 w-4" aria-hidden />
                            {rentang}
                        </span>
                    )}
                </div>
            </header>

            <PublikasiContent html={isiToHtml(item.isi)} />
        </article>
    )
}
