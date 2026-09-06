import { describe, expect, it } from 'bun:test'
import { buildBffApiUrl, downloadBffPdf, filenameFromDisposition, safeDownloadFilename } from '../download-file'

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

    it('parses Content-Disposition filenames', () => {
        expect(filenameFromDisposition('attachment; filename="laporan-paket-3.pdf"', 'laporan.pdf')).toBe(
            'laporan-paket-3.pdf',
        )
        expect(filenameFromDisposition(null, 'laporan.pdf')).toBe('laporan.pdf')
        expect(filenameFromDisposition('attachment', 'laporan.pdf')).toBe('laporan.pdf')
    })

    it('returns backend error message instead of navigating on failure', async () => {
        const origFetch = globalThis.fetch
        globalThis.fetch = (async () =>
            new Response(JSON.stringify({ message: 'Paket tidak ditemukan' }), {
                status: 404,
                headers: { 'content-type': 'application/json' },
            })) as typeof fetch
        try {
            expect(await downloadBffPdf('/bff/api/chat/reports/download?jenis=paket&id=1')).toBe(
                'Paket tidak ditemukan',
            )
        } finally {
            globalThis.fetch = origFetch
        }
    })
})
