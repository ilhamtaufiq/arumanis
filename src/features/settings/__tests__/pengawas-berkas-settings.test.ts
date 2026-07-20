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

    it('matches jenis_dokumen case-insensitively and via aliases', () => {
        expect(matchesPengawasSharedBerkasJudul('RAB', ['RAB'])).toBe(true)
        expect(matchesPengawasSharedBerkasJudul('Rab', ['RAB'])).toBe(true)
        expect(matchesPengawasSharedBerkasJudul(' rab ', ['RAB'])).toBe(true)
        expect(matchesPengawasSharedBerkasJudul('RAB Final', ['RAB'])).toBe(true)

        expect(matchesPengawasSharedBerkasJudul('GAMBAR', ['GAMBAR'])).toBe(true)
        expect(matchesPengawasSharedBerkasJudul('Gambar', ['GAMBAR'])).toBe(true)
        expect(matchesPengawasSharedBerkasJudul('gbr', ['GAMBAR'])).toBe(true)
        expect(matchesPengawasSharedBerkasJudul('GBR', ['GAMBAR'])).toBe(true)
        expect(matchesPengawasSharedBerkasJudul('G.B.R', ['GAMBAR'])).toBe(true)
        expect(matchesPengawasSharedBerkasJudul('gambar kerja', ['GAMBAR'])).toBe(true)

        expect(matchesPengawasSharedBerkasJudul('NEGO', ['NEGO'])).toBe(true)
        expect(matchesPengawasSharedBerkasJudul('Nego', ['NEGO'])).toBe(true)
        expect(matchesPengawasSharedBerkasJudul('Negosiasi', ['NEGO'])).toBe(true)
        expect(matchesPengawasSharedBerkasJudul('Hasil Negosiasi', ['NEGO'])).toBe(true)

        expect(matchesPengawasSharedBerkasJudul('Kontrak', ['RAB', 'GAMBAR', 'NEGO'])).toBe(false)
        expect(matchesPengawasSharedBerkasJudul('SPK', ['RAB'])).toBe(false)
    })
})
