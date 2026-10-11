import { describe, expect, it } from 'vitest'
import { BUKTI_MAX_COUNT, groupBuktiByRhk, sisaSlotBukti, validateBuktiSelection } from './bukti-helpers'

const berkas = (name: string, type: string, size = 1024) =>
    new File([new Uint8Array(size)], name, { type })

const foto = (id: number) => ({ id, url: `/f/${id}.jpg`, thumb: `/t/${id}.jpg` })

describe('validateBuktiSelection', () => {
    it('menolak format selain JPG/PNG dan berkas di atas 10 MB dengan pesan Indonesia', () => {
        const result = validateBuktiSelection(
            [
                berkas('a.jpg', 'image/jpeg'),
                berkas('b.webp', 'image/webp'),
                berkas('c.png', 'image/png', 10 * 1024 * 1024 + 1),
            ],
            0,
        )
        expect(result.accepted.map((f) => f.name)).toEqual(['a.jpg'])
        expect(result.messages[0]).toContain('JPG atau PNG')
        expect(result.messages[1]).toContain('10 MB')
    })

    it('membatasi 10 foto per RHK per bulan termasuk foto yang sudah ada', () => {
        const files = [berkas('1.jpg', 'image/jpeg'), berkas('2.jpg', 'image/jpeg')]
        const result = validateBuktiSelection(files, BUKTI_MAX_COUNT - 1)
        expect(result.accepted).toHaveLength(1)
        expect(result.messages[0]).toContain('per RHK per bulan')
    })
})

describe('groupBuktiByRhk', () => {
    it('membuat satu kartu per RHK master, diurutkan menurut nomor, dengan foto yang cocok', () => {
        const cards = groupBuktiByRhk(
            [
                { no: 2, rhk: 'Pelayanan' },
                { no: 1, rhk: 'Perencanaan' },
            ],
            [{ rhk: 2, foto: [foto(7)] }],
        )
        expect(cards.map((c) => c.no)).toEqual([1, 2])
        expect(cards[0].foto).toEqual([])
        expect(cards[1].foto.map((f) => f.id)).toEqual([7])
        expect(cards.every((c) => !c.orphan)).toBe(true)
    })

    it('tetap menampilkan foto RHK yang tidak ada di master sebagai kartu terpisah', () => {
        const cards = groupBuktiByRhk([{ no: 1, rhk: 'Perencanaan' }], [{ rhk: 5, foto: [foto(9)] }])
        expect(cards.map((c) => c.no)).toEqual([1, 5])
        expect(cards[1].orphan).toBe(true)
        expect(cards[1].foto).toHaveLength(1)
    })
})

describe('sisaSlotBukti', () => {
    it('menghitung sisa slot dan tidak pernah negatif', () => {
        expect(sisaSlotBukti(3)).toBe(7)
        expect(sisaSlotBukti(12)).toBe(0)
    })
})
