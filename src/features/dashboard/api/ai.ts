export interface RingkasanDashboardAi {
    tahun: string
    statistik: Record<string, number>
    pekerjaanPerluPerhatian: Array<{ nama: string; fisik: number; keuangan: number }>
}

interface AnalisaAiResponse {
    analisa: string
    model: string
}

/** Meminta analisa AI lewat BFF. Key AI hanya ada di server. */
export async function analyzeDashboard(ringkasan: RingkasanDashboardAi): Promise<AnalisaAiResponse> {
    const response = await fetch('/bff/ai/analyze', {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ ringkasan }),
    })

    const payload = (await response.json().catch(() => null)) as
        | (Partial<AnalisaAiResponse> & { message?: string })
        | null

    if (!response.ok || !payload?.analisa) {
        throw new Error(payload?.message || 'Analisa AI gagal dibuat.')
    }
    return payload as AnalisaAiResponse
}

export interface JawabanTanyaData {
    jawaban: string
    sumber: { tool: string; args: Record<string, unknown>; jumlah_baris: number | null } | null
    model?: string
}

/** Tanya-jawab data lewat BFF. Hanya tool yang sudah disiapkan server yang bisa dipakai. */
export async function tanyaData(pertanyaan: string, tahun: string): Promise<JawabanTanyaData> {
    const response = await fetch('/bff/ai/tanya', {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ pertanyaan, tahun }),
    })
    const payload = (await response.json().catch(() => null)) as
        | (Partial<JawabanTanyaData> & { message?: string })
        | null
    if (!response.ok || !payload?.jawaban) {
        throw new Error(payload?.message || 'Tanya-jawab gagal.')
    }
    return payload as JawabanTanyaData
}
