export type WhatsAppTemplateId =
    | 'laporan_belum'
    | 'deviasi_progress'
    | 'tiket_baru'
    | 'kontrak_h30'
    | 'data_quality'
    | 'custom'

export type WhatsAppTemplate = {
    id: WhatsAppTemplateId
    label: string
    description: string
    body: string
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
    {
        id: 'laporan_belum',
        label: 'Laporan belum diisi',
        description: 'Pengingat pengawas mengisi progress mingguan',
        body: `Yth. Bapak/Ibu {{nama}},

Mohon segera melengkapi laporan progress pekerjaan:
*{{paket}}*

Batas: {{batas}}
Link: {{url}}

Terima kasih.
ARUMANIS DPKP Cianjur`,
    },
    {
        id: 'deviasi_progress',
        label: 'Deviasi progress',
        description: 'Notifikasi deviasi realisasi vs rencana',
        body: `Yth. Bapak/Ibu {{nama}},

Progress *{{paket}}* mengalami deviasi {{deviasi}}%.
Rencana: {{rencana}}% · Realisasi: {{realisasi}}%

Mohon segera tindak lanjuti.
ARUMANIS DPKP Cianjur`,
    },
    {
        id: 'tiket_baru',
        label: 'Tiket baru / update',
        description: 'Pemberitahuan tiket operasional',
        body: `Yth. Bapak/Ibu {{nama}},

Tiket *{{subjek}}* (prioritas: {{prioritas}}) status: {{status}}.
{{deskripsi}}

Link: {{url}}
ARUMANIS DPKP Cianjur`,
    },
    {
        id: 'kontrak_h30',
        label: 'Kontrak H-30',
        description: 'Kontrak mendekati tanggal selesai',
        body: `Yth. Bapak/Ibu {{nama}},

Kontrak *{{paket}}* berakhir pada {{tgl_selesai}} (≤ 30 hari).
Nomor/SPK: {{spk}}

Mohon siapkan BA / evaluasi perpanjangan bila diperlukan.
ARUMANIS DPKP Cianjur`,
    },
    {
        id: 'data_quality',
        label: 'Lengkapi data paket',
        description: 'Pengingat kelengkapan foto/koordinat/kontrak',
        body: `Yth. Bapak/Ibu {{nama}},

Paket *{{paket}}* masih kurang: {{issue}}.
Mohon lengkapi segera di ARUMANIS.
Link: {{url}}

Terima kasih.`,
    },
]

export function applyTemplate(
    body: string,
    vars: Record<string, string | number | null | undefined>,
): string {
    return body.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, key: string) => {
        const value = vars[key]
        if (value === null || value === undefined || value === '') return '—'
        return String(value)
    })
}
