import { API_BASE } from '@/lib/api-base'

export interface PesanChat {
    role: 'user' | 'assistant'
    content: string
}

export interface SumberChat {
    tool: string
    args: Record<string, unknown>
    jumlah_baris: number | null
}

export type EventChat =
    | { type: 'status'; message: string }
    | { type: 'done'; jawaban: string; sumber: SumberChat[]; model?: string }
    | { type: 'error'; message: string }

/** Membaca satu blok SSE (`event:` dan `data:`) menjadi event aplikasi. */
function parseBlok(blok: string): EventChat | null {
    let nama = 'message'
    let data = ''
    for (const baris of blok.split('\n')) {
        if (baris.startsWith('event:')) nama = baris.slice(6).trim()
        else if (baris.startsWith('data:')) data += baris.slice(5).trim()
    }
    if (!data) return null
    const payload = JSON.parse(data) as Record<string, unknown>
    if (nama === 'status') return { type: 'status', message: String(payload.message ?? '') }
    if (nama === 'done') return { type: 'done', jawaban: String(payload.jawaban ?? ''), sumber: (payload.sumber as SumberChat[]) ?? [], model: payload.model as string | undefined }
    if (nama === 'error') return { type: 'error', message: String(payload.message ?? 'Chat gagal.') }
    return null
}

/** Riwayat chat tersimpan di server. Dibaca saat halaman dibuka. */
export async function ambilRiwayatChat(signal?: AbortSignal): Promise<PesanChat[]> {
    const response = await fetch(`${API_BASE}/ai/chat/history`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
        signal,
    })
    const payload = (await response.json().catch(() => null)) as { data?: PesanChat[]; message?: string } | null
    if (!response.ok || !payload?.data) {
        throw new Error(payload?.message || 'Riwayat chat belum bisa dimuat.')
    }
    return payload.data
}

/** Mengirim satu pertanyaan. Riwayat ada di server, jadi klien hanya mengirim pertanyaan baru. */
export async function kirimChat(
    pertanyaan: string,
    tahun: string,
    onEvent: (ev: EventChat) => void,
    signal?: AbortSignal,
): Promise<void> {
    const response = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'text/event-stream', 'Content-Type': 'application/json' },
        body: JSON.stringify({ pertanyaan, tahun }),
        signal,
    })
    if (!response.ok || !response.body) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(payload?.message || 'Chat gagal dimulai.')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let batas = buffer.indexOf('\n\n')
        while (batas >= 0) {
            const blok = buffer.slice(0, batas)
            buffer = buffer.slice(batas + 2)
            const ev = parseBlok(blok)
            if (ev) onEvent(ev)
            batas = buffer.indexOf('\n\n')
        }
    }
}
