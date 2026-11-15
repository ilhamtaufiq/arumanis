import type { AuditLog } from '@/features/calendar/types/audit'

/** Label ramah untuk tiap tipe model di audit log. Tipe yang tidak ada di sini memakai nama tipe yang dipecah. */
export const ACTIVITY_LABELS: Record<string, string> = {
    Foto: 'foto dokumentasi',
    Penerima: 'penerima manfaat',
    Pekerjaan: 'paket pekerjaan',
    Event: 'jadwal kegiatan',
    Berkas: 'berkas dokumen',
    Progress: 'progres pekerjaan',
    Kontrak: 'data kontrak',
    KontrakAddendum: 'adendum kontrak',
    Kegiatan: 'kegiatan',
    Output: 'output pekerjaan',
    Penyedia: 'penyedia',
    Pengawas: 'pengawas',
    Pengelola: 'pengelola',
    Tiket: 'tiket',
    TiketComment: 'komentar tiket',
    Blog: 'artikel',
    BlogComment: 'komentar artikel',
    KegiatanRole: 'peran kegiatan',
    OutputBaru: 'output',
    Desa: 'desa',
    Kecamatan: 'kecamatan',
    User: 'pengguna',
    Sk: 'SK',
    UsulanKegiatan: 'usulan kegiatan',
    DraftPekerjaan: 'draf pekerjaan',
    DocumentRegister: 'register dokumen',
    DocumentType: 'jenis dokumen',
    ChecklistItem: 'item checklist',
    UnitChecklist: 'checklist unit',
    UnitSpam: 'unit SPAM',
    SpamAchievement: 'capaian SPAM',
    SpamBudget: 'anggaran SPAM',
    SpmSanitasi: 'SPM sanitasi',
    PetaPeripaan: 'peta perpipaan',
    PanduanPage: 'halaman panduan',
    MenuPermission: 'izin menu',
    RoutePermission: 'izin rute',
    SignatureLibrary: 'pustaka tanda tangan',
    ToolPdf: 'perkakas PDF',
    Tag: 'tag',
    AppSetting: 'pengaturan aplikasi',
    UserDriveItem: 'berkas drive',
}

/** Kunci atribut yang dipakai sebagai nama objek, berurutan dari yang paling spesifik. */
const NAME_KEYS = [
    'nama_paket',
    'nama_kegiatan',
    'nama',
    'name',
    'title',
    'judul',
    'subjek',
    'nomor_kontrak',
    'keterangan',
]

export function pickName(values: Record<string, unknown> | null | undefined): string | null {
    if (!values) return null
    for (const key of NAME_KEYS) {
        const v = values[key]
        if (typeof v === 'string' && v.trim()) return v.trim()
    }
    return null
}

export function activityVerb(type: string, event: AuditLog['event']): string {
    if (event === 'deleted') return 'menghapus'
    if (event === 'updated') return 'memperbarui'
    switch (type) {
        case 'Foto':
        case 'Berkas':
        case 'UserDriveItem':
            return 'mengunggah'
        case 'Penerima':
            return 'mendaftarkan'
        case 'Event':
        case 'TiketComment':
        case 'BlogComment':
        case 'Blog':
            return 'menambahkan'
        default:
            return 'membuat'
    }
}

/** Nama tipe model tanpa namespace, mis. `App\\Models\\Pekerjaan` menjadi `Pekerjaan`. */
export function tipeModel(auditableType: string): string {
    return auditableType.split('\\').pop() ?? ''
}

/** Kalimat singkat untuk satu entri audit, tanpa nama pengguna. Contoh: "membuat paket pekerjaan Jalan Desa X". */
export function describeActivity(log: AuditLog): string {
    const type = tipeModel(log.auditable_type)
    const label = ACTIVITY_LABELS[type] ?? (type.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase() || 'data')
    const name =
        (type === 'Pekerjaan' ? log.pekerjaan?.nama_paket : null) ??
        pickName(log.new_values) ??
        pickName(log.old_values)
    return `${activityVerb(type, log.event)} ${label}${name ? ` ${name}` : ''}`
}
