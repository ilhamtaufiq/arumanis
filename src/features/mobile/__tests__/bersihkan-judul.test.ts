import { describe, expect, it } from 'vitest'
import { bersihkanJudul } from '../lib/bersihkan-judul'

describe('bersihkanJudul', () => {
    it('membuang tanda kutip dan titik berulang di tepi', () => {
        expect(bersihkanJudul('"""Kp. Kaum Rt.03 Rw. 06"""')).toBe('Kp. Kaum Rt.03 Rw. 06')
        expect(bersihkanJudul('..Pembangunan Sumur Bor')).toBe('Pembangunan Sumur Bor')
    })
    it('merapikan spasi berlebih dan tidak mengubah judul yang sudah bersih', () => {
        expect(bersihkanJudul('Pembangunan   MCK  Individu')).toBe('Pembangunan MCK Individu')
    })
})
