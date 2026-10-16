import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Send, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { kirimChat, type PesanChat, type SumberChat } from '../api/chat-stream'

interface BubbleChat extends PesanChat {
    sumber?: SumberChat[]
}

const CONTOH = [
    'Berapa pekerjaan yang sudah berkontrak?',
    'Desa mana yang paling banyak pagunya?',
    'Berapa SP2D terbaru dan nilainya?',
]

/** Chat multi-giliran dengan asisten data. Status tampil saat model mengambil data, jawaban menampilkan sumbernya. */
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
    }, [pesan, status])

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
                    if (ev.type === 'status') setStatus(ev.message)
                    if (ev.type === 'done') {
                        setStatus(null)
                        setPesan((p) => [...p, { role: 'assistant', content: ev.jawaban, sumber: ev.sumber }])
                    }
                    if (ev.type === 'error') {
                        setStatus(null)
                        toast.error(ev.message)
                    }
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

    return (
        <>
            <Header fixed />
            <Main fluid className="w-full max-w-none px-3 pb-4 pt-4 sm:px-5">
                <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-3xl flex-col gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
                            <Sparkles className="h-5 w-5" aria-hidden />
                            Asisten Data
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Tanya tentang data pembangunan TA {tahunAnggaran}. Jawaban diambil dari data Arumanis dan menyebut sumbernya.
                        </p>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border bg-card p-4" aria-live="polite">
                        {pesan.length === 0 && (
                            <div className="flex flex-col items-start gap-3 text-sm text-muted-foreground">
                                <p>Coba salah satu pertanyaan ini:</p>
                                <div className="flex flex-wrap gap-2">
                                    {CONTOH.map((c) => (
                                        <Button key={c} type="button" size="sm" variant="outline" onClick={() => void kirim(c)}>
                                            {c}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {pesan.map((m, i) => (
                            <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                                <div
                                    className={
                                        m.role === 'user'
                                            ? 'max-w-[85%] rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground'
                                            : 'max-w-[85%] space-y-2 rounded-2xl bg-muted px-4 py-2 text-sm'
                                    }
                                >
                                    {m.role === 'user' ? (
                                        <p className="whitespace-pre-wrap">{m.content}</p>
                                    ) : (
                                        <div className="space-y-2 leading-relaxed [&_li]:ml-4 [&_li]:list-disc">
                                            <ReactMarkdown>{m.content}</ReactMarkdown>
                                        </div>
                                    )}
                                    {m.sumber && m.sumber.length > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            Sumber: {m.sumber.map((s) => `${s.tool}${s.jumlah_baris !== null ? ` (${s.jumlah_baris} baris)` : ''}`).join(', ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {status && <p className="text-xs italic text-muted-foreground">{status}</p>}
                        <div ref={ujungRef} />
                    </div>

                    <form
                        className="flex gap-2"
                        onSubmit={(e) => {
                            e.preventDefault()
                            void kirim(teks)
                        }}
                    >
                        <Input
                            value={teks}
                            onChange={(e) => setTeks(e.target.value)}
                            maxLength={2000}
                            placeholder="Tulis pertanyaan…"
                            aria-label="Pertanyaan"
                            disabled={sedangKirim}
                        />
                        <Button type="submit" disabled={sedangKirim || !teks.trim()}>
                            <Send className="mr-2 h-4 w-4" aria-hidden />
                            Kirim
                        </Button>
                    </form>
                </div>
            </Main>
        </>
    )
}

export default AsistenAiPage
