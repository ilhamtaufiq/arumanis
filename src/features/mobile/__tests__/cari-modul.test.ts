import { describe, expect, it } from 'vitest'
import type { NavGroup } from '@/components/layout/type'
import { cariModul, pecahKueri } from '../lib/cari-modul'

const menu: NavGroup[] = [
    {
        title: 'Pekerjaan',
        items: [
            { title: 'Daftar Pekerjaan', url: '/pekerjaan' },
            {
                title: 'Kontrak',
                url: undefined,
                items: [
                    { title: 'Kontrak', url: '/kontrak' },
                    { title: 'Addendum', url: '/kontrak-addendums' },
                ],
            } as unknown as NavGroup['items'][number],
        ],
    },
    { title: 'SPAM', items: [{ title: 'Unit SPAM', url: '/spam-unit' }] },
]

describe('pecahKueri', () => {
    it('memecah dan membuat huruf kecil', () => {
        expect(pecahKueri('  Unit   SPAM ')).toEqual(['unit', 'spam'])
        expect(pecahKueri('   ')).toEqual([])
    })
})

describe('cariModul', () => {
    it('kosong bila kueri kosong', () => {
        expect(cariModul(menu, '')).toEqual([])
    })
    it('mencocokkan judul modul', () => {
        expect(cariModul(menu, 'spam')).toEqual([{ judul: 'Unit SPAM', grup: 'SPAM', url: '/spam-unit' }])
    })
    it('mencari sub-modul dan menyebut induknya', () => {
        const hasil = cariModul(menu, 'addendum')
        expect(hasil).toEqual([{ judul: 'Addendum', grup: 'Pekerjaan · Kontrak', url: '/kontrak-addendums' }])
    })
    it('semua kata harus cocok, tidak peduli huruf besar kecil', () => {
        expect(cariModul(menu, 'daftar PEKERJAAN').map((m) => m.url)).toEqual(['/pekerjaan'])
        expect(cariModul(menu, 'daftar spam')).toEqual([])
    })
})
