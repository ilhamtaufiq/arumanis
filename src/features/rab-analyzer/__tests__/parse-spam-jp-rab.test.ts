import { describe, expect, it } from 'vitest'
import { parseRabPaste } from '../lib/parse-rab-paste'

const SPAM_JP_SAMPLE = `NO\tURAIAN PEKERJAAN\t\t\t\t\tSAT\t VOLUME \t HARGA \t JUMLAH 
\t\t\t\t\t\t SATUAN \t HARGA 
\t\t\t\t\t\t (Rp) \t (Rp) 
I\tPEKERJAAN PERSIAPAN\t\t\t\t\t\t\t
1\tPembersihan lokasi\t\t\t\t\tLs\t 1,00 \t 300.000,00 \t 300.000,00 
4\tDokumentasi dan Pelaporan\t\t\t\t\t\t\t -
\ta.\tFoto Kegiatan\t\t\t\t\tset\t 3,00 \t 150.000,00 \t 450.000,00 
\tSUB TOTAL  I\t\t\t\t\t\t\t\t 3.750.000,00 
II\tPENGADAAN DAN PEMASANGAN PIPA DAN ASESORIS\t\t\t\t\t\t\t
1\tPengadaan Pipa\t\t\t\t\t\t\t
1,1\tPekerjaan Persiapan\t\t\t\t\t\t\t
a.\tPVC dia. 3"  S-12,5 RRJ\t\t\t\t\tm'\t 30,00 \t 100.650,00 \t 3.019.500,00 
2\tPengadaan dan Pemasangan Asesoris\t\t\t\t\t\t\t
a.\tReducer PVC all socket\t\t\t\t\t\t\t -
\t-\tDia. 3" x 2" (RRJ)\t\t\t\t\tbh\t 1,00 \t 119.623,00 \t 119.623,00 
III\tPEKERJAAN SAMBUNGAN RUMAH \t\t\t\t\t\t\t
1\tPengadaan pipa dan accessories sambungan rumah \t\t\t\t\tunit\t 22,00 \t 1.460.109,55 \t 32.122.410,10 
IV\t PEMBUATAN RESERVOIR 10 M3 \t\t\t\t\t\t\t
2,1\tGalian tanah \t\t\t\t\tm³\t 11,88 \t18.914,63\t 224.705,75 
V\tPENYELENGGARAAN SISTEM MANAJEMEN KESELAMATAN KONSTRUKSI (SMKK)\t\t\t\t\t\t\t
B\tSOSIALISASI , PROMOSI DAN PELATIHAN\t\t\t\t\t\t\t
\t1\tInduksi K3 (Safety Induction)\t\t\t\t\tOrg\t 4,00 \t 10.000,00 \t40.000,00
C\tPERALATAN PELINDUNGKERJA (APK) DAN ALAT PELINDUNG DIRI DIRI (APD)\t\t\t\t\t\t\t
\t1\tAlat Pelindung Diri (APD) terdiri atas:\t\t\t\t\t\t\t
\t\t1\tTopi Pelindung (Safety Helmet)\t\t\t\t\tBh\t 4,00 \t 25.000,00 \t100.000,00`

describe('parseSpamJpRabRows', () => {
    it('parses SPAM JP format with comma-decimal harga', () => {
        const items = parseRabPaste(SPAM_JP_SAMPLE)
        expect(items.length).toBeGreaterThanOrEqual(8)

        const pembersihan = items.find((item) => item.uraian.includes('Pembersihan lokasi'))
        expect(pembersihan).toMatchObject({
            grup: 'PEKERJAAN PERSIAPAN',
            satuan: 'Ls',
            volume: 1,
            hargaSatuan: 300000,
        })
    })

    it('parses lettered and dash-nested accessory items', () => {
        const items = parseRabPaste(SPAM_JP_SAMPLE)
        const reducer = items.find((item) => item.uraian.includes('Dia. 3" x 2"'))
        expect(reducer).toBeDefined()
        expect(reducer?.satuan).toBe('bh')
        expect(reducer?.hargaSatuan).toBe(119623)
    })

    it('parses hierarchical numbered sections', () => {
        const items = parseRabPaste(SPAM_JP_SAMPLE)
        const pvc = items.find((item) => item.uraian.includes('PVC dia. 3"'))
        expect(pvc?.grup).toContain('PENGADAAN DAN PEMASANGAN PIPA')
        expect(pvc?.grup).toContain('Pengadaan Pipa')
    })

    it('parses dokumentasi sub-items under parent item 4', () => {
        const items = parseRabPaste(SPAM_JP_SAMPLE)
        const foto = items.find((item) => item.uraian.includes('Foto Kegiatan'))
        expect(foto?.grup).toContain('PEKERJAAN PERSIAPAN')
        expect(foto?.volume).toBe(3)
    })

    it('skips SUB TOTAL rows', () => {
        const items = parseRabPaste(SPAM_JP_SAMPLE)
        expect(items.some((item) => item.uraian.toLowerCase().includes('sub total'))).toBe(false)
    })

    it('parses reservoir galian with comma decimals', () => {
        const items = parseRabPaste(SPAM_JP_SAMPLE)
        const galian = items.find((item) => item.uraian.toLowerCase().includes('galian tanah'))
        expect(galian?.volume).toBeCloseTo(11.88, 2)
        expect(galian?.hargaSatuan).toBeCloseTo(18914.63, 2)
    })
})