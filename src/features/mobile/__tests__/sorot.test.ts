import { describe, expect, it } from 'vitest'
import { sorotPotongan } from '../lib/sorot'

describe('sorotPotongan', () => {
    it('menandai kata yang cocok tanpa peduli huruf besar kecil', () => {
        expect(sorotPotongan('Jaringan Pipa Desa Sukamaju', 'sukamaju')).toEqual([
            { teks: 'Jaringan Pipa Desa ', cocok: false },
            { teks: 'Sukamaju', cocok: true },
        ])
    })
    it('tanpa kueri, seluruh judul tidak disorot', () => {
        expect(sorotPotongan('Unit', '  ')).toEqual([{ teks: 'Unit', cocok: false }])
    })
})
