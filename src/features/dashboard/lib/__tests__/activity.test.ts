import { describe, expect, it } from 'vitest'
import type { AuditLog } from '@/features/calendar/types/audit'
import { activityVerb, describeActivity, pickName, tipeModel } from '../activity'

function log(partial: Partial<AuditLog>): AuditLog {
    return {
        id: 1,
        event: 'created',
        auditable_type: 'App\\Models\\Pekerjaan',
        created_at: '2026-01-01T00:00:00Z',
        new_values: null,
        old_values: null,
        ...partial,
    } as AuditLog
}

describe('tipeModel', () => {
    it('membuang namespace', () => {
        expect(tipeModel('App\\Models\\Pekerjaan')).toBe('Pekerjaan')
        expect(tipeModel('Pekerjaan')).toBe('Pekerjaan')
    })
})

describe('pickName', () => {
    it('memakai kunci pertama yang berisi teks', () => {
        expect(pickName({ nama_paket: '  ', nama: 'Desa Maju' })).toBe('Desa Maju')
    })
    it('mengembalikan null bila tidak ada', () => {
        expect(pickName(null)).toBeNull()
        expect(pickName({ foo: 1 })).toBeNull()
    })
})

describe('activityVerb', () => {
    it('mengikuti kejadian lebih dulu', () => {
        expect(activityVerb('Foto', 'deleted')).toBe('menghapus')
        expect(activityVerb('Foto', 'updated')).toBe('memperbarui')
    })
    it('memakai kata kerja sesuai tipe saat dibuat', () => {
        expect(activityVerb('Foto', 'created')).toBe('mengunggah')
        expect(activityVerb('Penerima', 'created')).toBe('mendaftarkan')
        expect(activityVerb('Tiket', 'created')).toBe('membuat')
    })
})

describe('describeActivity', () => {
    it('memakai nama paket dari relasi pekerjaan', () => {
        const text = describeActivity(
            log({ event: 'created', pekerjaan: { nama_paket: 'Jaringan Desa X' } as AuditLog['pekerjaan'] }),
        )
        expect(text).toBe('membuat paket pekerjaan Jaringan Desa X')
    })
    it('memakai nilai baru, lalu nilai lama, untuk nama', () => {
        expect(
            describeActivity(log({ auditable_type: 'App\\Models\\Tiket', new_values: { subjek: 'Air mati' } })),
        ).toBe('membuat tiket Air mati')
        expect(
            describeActivity(log({ auditable_type: 'App\\Models\\Tiket', event: 'deleted', old_values: { judul: 'Lama' } })),
        ).toBe('menghapus tiket Lama')
    })
    it('memecah nama tipe yang tidak dikenal', () => {
        expect(describeActivity(log({ auditable_type: 'App\\Models\\MetodeBaru', event: 'updated' }))).toBe(
            'memperbarui metode baru',
        )
    })
})
