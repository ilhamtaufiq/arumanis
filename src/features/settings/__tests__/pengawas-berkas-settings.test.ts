import { describe, expect, it } from 'vitest'
import {
    getPengawasVisibleBerkasJuduls,
    isPengawasBerkasJudulEnabled,
    matchesPengawasSharedBerkasJudul,
    type AppSetting,
} from '../api'

const setting = (key: string, value: string): AppSetting => ({
    id: 1,
    key,
    value,
    type: 'text',
    updated_at: '',
})

describe('pengawas berkas settings', () => {
    it('defaults all shared titles to disabled', () => {
        expect(getPengawasVisibleBerkasJuduls(undefined)).toEqual([])
        expect(getPengawasVisibleBerkasJuduls([])).toEqual([])
        expect(isPengawasBerkasJudulEnabled(undefined, 'RAB')).toBe(false)
    })

    it('returns only enabled titles', () => {
        const settings = [
            setting('pengawas_berkas_show_rab', '1'),
            setting('pengawas_berkas_show_gambar', '0'),
            setting('pengawas_berkas_show_nego', '1'),
        ]
        expect(getPengawasVisibleBerkasJuduls(settings)).toEqual(['RAB', 'NEGO'])
    })

    it('matches jenis_dokumen case-insensitively', () => {
        expect(matchesPengawasSharedBerkasJudul('RAB', ['RAB'])).toBe(true)
        expect(matchesPengawasSharedBerkasJudul(' rab ', ['RAB'])).toBe(true)
        expect(matchesPengawasSharedBerkasJudul('RAB Final', ['RAB'])).toBe(false)
        expect(matchesPengawasSharedBerkasJudul('Kontrak', ['RAB', 'GAMBAR', 'NEGO'])).toBe(false)
    })
})
