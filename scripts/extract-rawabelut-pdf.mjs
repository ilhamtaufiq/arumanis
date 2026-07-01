import fs from 'node:fs';
import path from 'node:path';

const downloads = 'C:/Users/asusg/Downloads';
const outputJson = path.join(downloads, 'rawabelut_parsed.json');

function cleanCoord(value, isLongitude = false) {
    if (!value) return null;
    const compact = String(value).replace(/\s/g, '');
    let parsed = Number.parseFloat(compact);
    if (!Number.isNaN(parsed) && Math.abs(parsed) <= (isLongitude ? 180 : 90)) {
        return Math.round(parsed * 1_000_000) / 1_000_000;
    }
    const digits = String(value).replace(/\D/g, '');
    if (!digits) return null;
    const sign = String(value).includes('-') ? -1 : 1;
    if (isLongitude && digits.length >= 8) {
        return Math.round(sign * Number.parseFloat(`${digits.slice(0, 3)}.${digits.slice(3)}`) * 1_000_000) / 1_000_000;
    }
    if (!isLongitude && digits.length >= 6) {
        for (const cut of [1, 2]) {
            const candidate = sign * Number.parseFloat(`${digits.slice(0, cut)}.${digits.slice(cut)}`);
            if (Math.abs(candidate) <= 90) {
                return Math.round(candidate * 1_000_000) / 1_000_000;
            }
        }
    }
    return null;
}

function normalizeNik(raw) {
    return String(raw ?? '').replace(/\D/g, '').slice(0, 16);
}

const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
const pdfPath = path.join(downloads, 'DAFTAR NAMA WARGA PENERIMA  PAM DESA RAWABELUT.pdf');
const bytes = new Uint8Array(fs.readFileSync(pdfPath));
const doc = await pdfjs.getDocument({ data: bytes }).promise;

let fullText = '';
for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    fullText += ` ${content.items.map((item) => item.str).join(' ')}`;
}

const text = fullText.replace(/\s+/g, ' ').trim();
const entryPattern = /(\d{1,3})\.\s+(?:(\d+)\s+)?([A-Za-z][A-Za-z\s]*?)\s+KP\.?\s*(.+?)\s+NIK\s*:\s*([\d\s]+?)\s+(\d+)\s*JIWA\s+LAT\s*:\s*(-?[\d.\s]+?)\s+LONG\s*:\s*(-?[\d.\s]+?)(?=\s+\d{1,3}\.\s|$)/gi;

const rows = [];
let match = entryPattern.exec(text);
while (match) {
    const no = Number.parseInt(match[1], 10);
    const alamat = `KP. ${match[4].trim()}`.replace(/\s+/g, ' ');

    if (alamat.length < 400) {
        rows.push({
            no,
            nama: match[3].trim(),
            nik: normalizeNik(match[5]),
            alamat,
            jumlah_jiwa: Number.parseInt(match[6], 10),
            latitude: cleanCoord(match[7], false),
            longitude: cleanCoord(match[8], true),
            nama_file_foto_0: `${String(no).padStart(3, '0')}_0.jpg`,
        });
    }

    match = entryPattern.exec(text);
}

fs.writeFileSync(outputJson, JSON.stringify(rows, null, 2), 'utf8');
console.log(`RAWABELUT extracted: ${rows.length} rows -> ${outputJson}`);