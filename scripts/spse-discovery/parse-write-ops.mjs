import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const runDir = process.argv[2]
if (!runDir) {
    console.error('Usage: node parse-write-ops.mjs <output-run-dir>')
    process.exit(1)
}

function parseMultipart(body) {
    if (!body || !body.includes('form-data')) return null
    const fields = {}
    const re = /name="([^"]+)"\r\n\r\n([\s\S]*?)(?=\r\n------)/g
    let m
    while ((m = re.exec(body)) !== null) {
        fields[m[1]] = m[2].trim()
    }
    return fields
}

const ops = JSON.parse(await readFile(join(runDir, 'write-operations.json'), 'utf8'))
const kontrakOps = ops.filter((o) => /sppbj-pl|spk-pl|sskk-pl/.test(o.url))

const flow = kontrakOps.map((o) => ({
    method: o.method,
    url: o.url,
    urlPattern: o.urlPattern,
    status: o.status,
    referer: o.referer,
    fields: parseMultipart(o.postData),
}))

const mapping = [
    { arumanis: 'kode_paket', spse: 'plId (query param)', example: '10919928000' },
    { arumanis: 'sppbj', spse: 'sppbj.sppbj_no', example: '602.4/SPPBJ/...' },
    { arumanis: 'tgl_sppbj', spse: 'sppbj.sppbj_tgl_kirim', format: 'DD-MM-YYYY' },
    { arumanis: 'penyedia', spse: 'rekananId', example: '401418', note: 'lookup ID penyedia di SPSE' },
    { arumanis: 'spk', spse: 'spk.spk_no' },
    { arumanis: 'tgl_spk', spse: 'spk.spk_tgl', format: 'DD-MM-YYYY' },
    { arumanis: 'nilai_kontrak', spse: 'spk.spk_nilai', format: 'desimal koma, contoh 149444256,15' },
    { arumanis: 'spmk', spse: 'pesanan.pes_no' },
    { arumanis: 'tgl_spmk', spse: 'pesanan.pes_tgl', format: 'DD-MM-YYYY' },
    { arumanis: 'tgl_selesai', spse: 'tgl_selesai', format: 'DD-MM-YYYY' },
]

const out = { flow, mapping, ids: { plId: '10919928000', sppbjId: '10505359000', spkId: '10449553000', rekananId: '401418' } }
await writeFile(join(runDir, 'kontrak-flow-analysis.json'), JSON.stringify(out, null, 2), 'utf8')
console.log(JSON.stringify(out, null, 2))