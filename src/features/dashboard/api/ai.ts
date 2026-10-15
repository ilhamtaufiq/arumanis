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
