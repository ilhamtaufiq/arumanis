import { describe, expect, it } from 'vitest'
import {
    DEFAULT_JENIS_DOKUMEN,
    findJenisDokumenMatch,
    mergeJenisDokumenOptions,
    normalizeJenisDokumenLabel,
} from '../jenis-dokumen'

describe('jenis-dokumen helpers', () => {
    it('includes standard defaults', () => {
        expect(DEFAULT_JENIS_DOKUMEN).toContain('RAB')
        expect(DEFAULT_JENIS_DOKUMEN).toContain('GAMBAR')
        expect(DEFAULT_JENIS_DOKUMEN).toContain('NEGO')
    })

    it('merges defaults, api, extras without case-insensitive duplicates', () => {
        const merged = mergeJenisDokumenOptions(['rab', 'Kontrak SPK'], ['Gambar Kerja'], 'SPK')
        expect(merged[0]).toBe('RAB')
        expect(merged.filter((item) => item.toLowerCase() === 'rab')).toHaveLength(1)
        expect(merged).toContain('Kontrak SPK')
        expect(merged).toContain('Gambar Kerja')
        expect(merged).toContain('SPK')
    })

    it('finds match case-insensitively', () => {
        expect(findJenisDokumenMatch(['RAB', 'GAMBAR'], 'rab')).toBe('RAB')
        expect(findJenisDokumenMatch(['RAB'], 'nego')).toBeUndefined()
    })

    it('normalizes whitespace', () => {
        expect(normalizeJenisDokumenLabel('  Hasil   Negosiasi  ')).toBe('Hasil Negosiasi')
    })
})
