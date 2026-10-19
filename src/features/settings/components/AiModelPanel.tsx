import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bot, Loader2, RefreshCw, Save } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api-client'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AiModelsResponse {
    model_aktif: string
    data: { id: string }[]
}

const KUNCI = ['ai-models'] as const

/** Pilih model Asisten AI dari daftar yang disediakan layanan AI (AI_BASE_URL). Hanya admin. */
export function AiModelPanel() {
    const queryClient = useQueryClient()
    const [pilihan, setPilihan] = useState<string>('')

    const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
        queryKey: KUNCI,
        queryFn: () => api.get<AiModelsResponse>('/ai/models'),
        staleTime: 5 * 60_000,
        retry: false,
    })

    useEffect(() => {
        if (data?.model_aktif) setPilihan(data.model_aktif)
    }, [data?.model_aktif])

    const simpan = useMutation({
        mutationFn: (model: string) => api.put<{ model_aktif: string }>('/ai/model', { model }),
        onSuccess: (res) => {
            toast.success(`Model AI diubah ke ${res.model_aktif}`)
            queryClient.invalidateQueries({ queryKey: KUNCI })
        },
        onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal menyimpan model AI')),
    })

    const aktif = data?.model_aktif ?? ''
    const adaPerubahan = pilihan !== '' && pilihan !== aktif

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Bot className="h-5 w-5 text-primary" />
                    Model Asisten AI
                </CardTitle>
                <CardDescription>
                    Pilih model dari layanan AI yang terhubung. Perubahan berlaku pada permintaan berikutnya.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Memuat daftar model...
                    </p>
                ) : isError ? (
                    <div className="space-y-2">
                        <p className="text-sm text-destructive">
                            {getApiErrorMessage(error, 'Daftar model tidak bisa dimuat')}
                        </p>
                        <Button variant="outline" size="sm" onClick={() => void refetch()}>
                            <RefreshCw className="h-4 w-4" /> Coba lagi
                        </Button>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground">
                            Model aktif: <span className="font-medium text-foreground">{aktif || '-'}</span>
                        </p>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Select value={pilihan} onValueChange={setPilihan}>
                                <SelectTrigger className="sm:w-[360px]">
                                    <SelectValue placeholder="Pilih model" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(data?.data ?? []).map((m) => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.id}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                disabled={!adaPerubahan || simpan.isPending}
                                onClick={() => simpan.mutate(pilihan)}
                            >
                                {simpan.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Simpan model
                            </Button>
                            <Button variant="ghost" size="sm" disabled={isFetching} onClick={() => void refetch()}>
                                <RefreshCw className={isFetching ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} /> Muat ulang daftar
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default AiModelPanel
