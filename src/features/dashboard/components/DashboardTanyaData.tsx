import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import { MessageCircleQuestion } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { tanyaData } from '../api/ai'

interface DashboardTanyaDataProps {
    tahun: string
}

const CONTOH = [
    'Berapa total pagu pekerjaan aktif?',
    'Pekerjaan apa saja yang progres fisiknya di bawah 50%?',
]

/** Tanya-jawab data. Jawaban selalu menampilkan sumber (tool, parameter, dan jumlah baris) supaya bisa diperiksa. */
export function DashboardTanyaData({ tahun }: DashboardTanyaDataProps) {
    const [pertanyaan, setPertanyaan] = useState('')
    const mutation = useMutation({
        mutationFn: (q: string) => tanyaData(q, tahun),
    })

    const kirim = (q: string) => {
        const bersih = q.trim()
        if (!bersih) return
        mutation.mutate(bersih)
    }

    return (
        <Card>
            <CardHeader className="space-y-0 pb-3">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <MessageCircleQuestion className="h-4 w-4" aria-hidden />
                        Tanya data
                    </CardTitle>
                    <Button asChild variant="ghost" size="sm">
                        <Link to="/asisten-ai">Buka chat</Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                        e.preventDefault()
                        kirim(pertanyaan)
                    }}
                >
                    <Input
                        value={pertanyaan}
                        onChange={(e) => setPertanyaan(e.target.value)}
                        maxLength={500}
                        placeholder="Tanya tentang data TA ini…"
                        aria-label="Pertanyaan tentang data"
                    />
                    <Button type="submit" disabled={mutation.isPending || !pertanyaan.trim()}>
                        {mutation.isPending ? 'Mencari…' : 'Tanya'}
                    </Button>
                </form>

                {!mutation.data && !mutation.isPending && (
                    <div className="flex flex-wrap gap-2">
                        {CONTOH.map((c) => (
                            <Button
                                key={c}
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setPertanyaan(c)
                                    kirim(c)
                                }}
                            >
                                {c}
                            </Button>
                        ))}
                    </div>
                )}

                {mutation.isError && (
                    <p role="alert" className="text-destructive">{mutation.error.message}</p>
                )}

                {mutation.data && (
                    <div className="space-y-2">
                        <div className="space-y-2 leading-relaxed [&_li]:ml-4 [&_li]:list-disc">
                            <ReactMarkdown>{mutation.data.jawaban}</ReactMarkdown>
                        </div>
                        {mutation.data.sumber ? (
                            <p className="text-xs text-muted-foreground">
                                Sumber: tool <code>{mutation.data.sumber.tool}</code>
                                {Object.keys(mutation.data.sumber.args).length > 0
                                    ? ` dengan ${JSON.stringify(mutation.data.sumber.args)}`
                                    : ''}
                                {mutation.data.sumber.jumlah_baris !== null
                                    ? `, ${mutation.data.sumber.jumlah_baris} baris`
                                    : ''}
                                {mutation.data.model ? `. Model: ${mutation.data.model}` : ''}.
                            </p>
                        ) : null}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
