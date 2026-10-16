import { useEffect, useRef, useState } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { kirimChat } from '../api/chat-stream'
import { labelStatus } from '../lib/labels'
import { ChatBubble, TypingIndicator, type BubbleChat } from './ChatBubble'
import { Composer } from './Composer'
import { EmptyState } from './EmptyState'

/** Asisten Data: chat multi-giliran dengan jawaban yang menyebut sumbernya. */
export function AsistenAiPage() {
    const { tahunAnggaran } = useAppSettingsValues()
    const [pesan, setPesan] = useState<BubbleChat[]>([])
    const [teks, setTeks] = useState('')
    const [status, setStatus] = useState<string | null>(null)
    const [sedangKirim, setSedangKirim] = useState(false)
    const abortRef = useRef<AbortController | null>(null)
    const ujungRef = useRef<HTMLDivElement>(null)

    useEffect(() => () => abortRef.current?.abort(), [])
    useEffect(() => {
        ujungRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, [pesan.length, status])

    const kirim = async (isi: string) => {
        const bersih = isi.trim()
        if (!bersih || sedangKirim) return
        const riwayat: BubbleChat[] = [...pesan, { role: 'user', content: bersih }]
        setPesan(riwayat)
        setTeks('')
        setSedangKirim(true)
        setStatus('Memproses…')
        const controller = new AbortController()
        abortRef.current = controller

        try {
            await kirimChat(
                riwayat.map(({ role, content }) => ({ role, content })),
                tahunAnggaran,
                (ev) => {
                    if (ev.type === 'status') setStatus(labelStatus(ev.message))
                    if (ev.type === 'done') {
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
            setStatus(null)
            setSedangKirim(false)
        }
    }

    const chatBaru = () => {
        abortRef.current?.abort()
        setPesan([])
        setTeks('')
        setStatus(null)
        setSedangKirim(false)
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
                                <p className="truncate text-xs text-muted-foreground">Tanya tentang data pembangunan Arumanis</p>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <Badge variant="outline" className="hidden sm:inline-flex">TA {tahunAnggaran}</Badge>
                            <Button type="button" variant="outline" size="sm" onClick={chatBaru} disabled={!adaPesan && !sedangKirim}>
                                <Plus className="mr-1.5 h-4 w-4" aria-hidden />
                                Chat baru
                            </Button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6" aria-live="polite">
                        <div className="mx-auto flex max-w-3xl flex-col gap-5">
                            {!adaPesan && !sedangKirim ? (
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
                            <Composer value={teks} onChange={setTeks} onSubmit={() => void kirim(teks)} disabled={sedangKirim} />
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
