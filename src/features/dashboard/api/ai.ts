import { API_BASE } from '@/lib/api-base'

export interface RingkasanDashboardAi {
    tahun: string
    statistik: Record<string, number>
    pekerjaanPerluPerhatian: Array<{ nama: string; fisik: number; keuangan: number }>
}

interface AnalisaAiResponse {
    analisa: string
    model: string
}

export interface JawabanTanyaData {
    jawaban: string
    sumber: { tool: string; args: Record<string, unknown>; jumlah_baris: number | null } | null
    model?: string
}

/** Pesan galat dari API Rust (`message`), atau pesan umum bila body tidak bisa dibaca. */
async function bacaRespons<T extends object>(response: Response, fallback: string): Promise<T> {
    const payload = (await response.json().catch(() => null)) as (T & { message?: string }) | null
    if (!response.ok || !payload) {
        throw new Error(payload?.message || fallback)
    }
    return payload
}

const postAi = (path: string, body: unknown) =>
    fetch(`${API_BASE}${path}`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })

/** Analisa dashboard lewat API Rust. Key AI hanya ada di server. */
export async function analyzeDashboard(ringkasan: RingkasanDashboardAi): Promise<AnalisaAiResponse> {
    const response = await postAi('/ai/analyze', { ringkasan })
    return bacaRespons<AnalisaAiResponse>(response, 'Analisa AI gagal dibuat.')
}

/** Tanya-jawab data lewat API Rust. Hanya tool yang disiapkan server yang bisa dipakai. */
export async function tanyaData(pertanyaan: string, tahun: string): Promise<JawabanTanyaData> {
    const response = await postAi('/ai/tanya', { pertanyaan, tahun })
    return bacaRespons<JawabanTanyaData>(response, 'Tanya-jawab gagal.')
}
