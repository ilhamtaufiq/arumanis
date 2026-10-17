import { useEffect, useRef, useState } from 'react'
import { Database, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { ambilRiwayatChat, kirimChat } from '../api/chat-stream'
import { labelStatus } from '../lib/labels'
import { ChatBubble, TypingIndicator, type BubbleChat } from './ChatBubble'
import { Composer } from './Composer'
import { EmptyState } from './EmptyState'

/**
 * Asisten Data: satu percakapan yang tersimpan di server. Asisten mengingat percakapan sebelumnya,
 * jadi riwayat dimuat saat halaman dibuka dan pertanyaan baru hanya dikirim satu per satu.
 */
export function AsistenAiPage() {
    const { tahunAnggaran } = useAppSettingsValues()
    const [pesan, setPesan] = useState<BubbleChat[]>([])
    const [memuat, setMemuat] = useState(true)
    const [gagalMemuat, setGagalMemuat] = useState<string | null>(null)
    const [teks, setTeks] = useState('')
    const [status, setStatus] = useState<string | null>(null)
    const [sedangKirim, setSedangKirim] = useState(false)
    const abortRef = useRef<AbortController | null>(null)
    const ujungRef = useRef<HTMLDivElement>(null)

    // Riwayat dimuat sekali saat halaman dibuka.
    useEffect(() => {
        const controller = new AbortController()
        ambilRiwayatChat(controller.signal)
            .then((riwayat) => setPesan(riwayat.map((m) => ({ role: m.role, content: m.content, sumber: m.sumber ?? undefined }))))
            .catch((error) => {
                if (!controller.signal.aborted) {
                    setGagalMemuat(error instanceof Error ? error.message : 'Riwayat chat belum bisa dimuat.')
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setMemuat(false)
            })
        return () => controller.abort()
    }, [])

    useEffect(() => () => abortRef.current?.abort(), [])
    useEffect(() => {
        ujungRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, [pesan.length, status])

    const kirim = async (isi: string) => {
        const bersih = isi.trim()
        if (!bersih || sedangKirim) return
        setPesan((p) => [...p, { role: 'user', content: bersih }])
        setTeks('')
        setSedangKirim(true)
        setStatus('Memproses…')
        const controller = new AbortController()
        abortRef.current = controller

        let berhasil = false
        try {
            await kirimChat(
                bersih,
                tahunAnggaran,
                (ev) => {
                    if (ev.type === 'status') setStatus(labelStatus(ev.message))
                    if (ev.type === 'done') {
                        berhasil = true
                        setPesan((p) => [...p, { role: 'assistant', content: ev.jawaban, sumber: ev.sumber }])
                    }
                    if (ev.type === 'error') toast.error(ev.message)
                },
                controller.signal,
            )
        } catch (error) {
            if (!controller.signal.aborted) {
                toast.error(error instanceof Error ? error.message : 'Chat gagal.')
            }
        } finally {
            // Bila gagal, pertanyaan dikembalikan ke kolom agar bisa dikirim ulang tanpa mengetik lagi.
            if (!berhasil && !controller.signal.aborted) {
                setPesan((p) => (p.at(-1)?.role === 'user' ? p.slice(0, -1) : p))
                setTeks(bersih)
            }
            setStatus(null)
            setSedangKirim(false)
        }
    }

    const adaPesan = pesan.length > 0

    return (
        <>
            <Header fixed />
            <Main fluid className="w-full max-w-none px-0 pb-0 pt-0">
                <div className="flex h-[calc(100svh-3.5rem)] flex-col">
                    <header className="flex items-center justify-between gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Sparkles className="h-4 w-4" aria-hidden />
                            </div>
                            <div className="min-w-0">
                                <h1 className="truncate text-base font-semibold tracking-tight">Asisten Data</h1>
                                <p className="truncate text-xs text-muted-foreground">
                                    Percakapan tersimpan. Asisten mengingat hal yang pernah dibahas.
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="shrink-0 gap-1.5">
                            <Database className="h-3 w-3" aria-hidden />
                            TA {tahunAnggaran}
                        </Badge>
                    </header>

                    <div
                        className="flex-1 overflow-y-auto px-4 py-6 sm:px-6"
                        role="log"
                        aria-live="polite"
                        aria-busy={memuat || sedangKirim}
                        aria-label="Percakapan dengan Asisten Data"
                    >
                        <div className="mx-auto flex max-w-3xl flex-col gap-5">
                            {memuat ? (
                                <div className="space-y-4" aria-label="Memuat riwayat">
                                    <Skeleton className="ml-auto h-10 w-2/5 rounded-2xl" />
                                    <Skeleton className="h-20 w-3/4 rounded-2xl" />
                                    <Skeleton className="ml-auto h-10 w-1/3 rounded-2xl" />
                                </div>
                            ) : gagalMemuat ? (
                                <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                                    {gagalMemuat}. Muat ulang halaman untuk mencoba lagi.
                                </p>
                            ) : !adaPesan && !sedangKirim ? (
                                <EmptyState tahun={tahunAnggaran} onPilih={(t) => void kirim(t)} />
                            ) : (
                                pesan.map((m, i) => <ChatBubble key={i} message={m} />)
                            )}
                            {sedangKirim && <TypingIndicator label={status} />}
                            <div ref={ujungRef} />
                        </div>
                    </div>

                    <div className="border-t bg-background px-4 pb-4 pt-3 sm:px-6">
                        <div className="mx-auto max-w-3xl space-y-2">
                            <Composer
                                value={teks}
                                onChange={setTeks}
                                onSubmit={() => void kirim(teks)}
                                disabled={sedangKirim || memuat || !!gagalMemuat}
                            />
                            <p className="text-center text-[11px] text-muted-foreground">
                                Jawaban AI bisa keliru. Periksa angka pada sumbernya sebelum mengambil keputusan.
                            </p>
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}

export default AsistenAiPage
