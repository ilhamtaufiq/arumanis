import { describe, expect, it } from 'vitest'
import { atasanToForm, atasanToPayload, emptyAtasan } from './atasan-helpers'

describe('atasanToPayload', () => {
    it('membuang spasi dan tetap mengirim string kosong, bukan null', () => {
        expect(
            atasanToPayload({
                nama: '  Dr. Budi Santoso, S.T., M.T.  ',
                nip: '   ',
                pangkat: '',
                jabatan: ' Kepala Dinas ',
                unit: 'Dinas PU',
            }),
        ).toEqual({
            nama: 'Dr. Budi Santoso, S.T., M.T.',
            nip: '',
            pangkat: '',
            jabatan: 'Kepala Dinas',
            unit: 'Dinas PU',
        })
    })

    it('form kosong menghasilkan payload dengan lima string kosong', () => {
        expect(atasanToPayload(emptyAtasan())).toEqual({ nama: '', nip: '', pangkat: '', jabatan: '', unit: '' })
    })
})

describe('atasanToForm', () => {
    it('mengubah null dan data yang tidak lengkap menjadi string kosong', () => {
        expect(atasanToForm({ nama: 'Budi', nip: null })).toEqual({
            nama: 'Budi',
            nip: '',
            pangkat: '',
            jabatan: '',
            unit: '',
        })
        expect(atasanToForm(null)).toEqual(emptyAtasan())
    })
})
