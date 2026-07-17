import { describe, expect, it } from 'bun:test'
import { buildBffApiUrl, safeDownloadFilename } from '../download-file'

describe('download-file helpers', () => {
    it('builds same-origin BFF URLs with query params', () => {
        expect(buildBffApiUrl('/pekerjaan/682/download-all-berkas', { format: 'original' })).toBe(
            '/bff/api/pekerjaan/682/download-all-berkas?format=original',
        )
        expect(buildBffApiUrl('berkas/1/export-pdf')).toBe('/bff/api/berkas/1/export-pdf')
    })

    it('skips empty query values', () => {
        expect(buildBffApiUrl('/x', { a: undefined, b: null, c: '' })).toBe('/bff/api/x')
    })

    it('sanitizes download filenames', () => {
        expect(safeDownloadFilename('Paket A/B:1.zip')).toBe('Paket A_B_1.zip')
        expect(safeDownloadFilename('   ')).toBe('download')
    })
})
