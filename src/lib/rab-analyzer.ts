import * as pdfjs from 'pdfjs-dist';
import * as XLSX from 'xlsx';

// Initialize PDF.js worker
// In a Vite/React environment, we usually need to set the worker path.
// For now, assume it's handled or we'll set it in the component.

export interface RabItem {
  type: 'header' | 'item';
  no: string;
  item: string;
  satuan: string;
  vol: string | number;
  harga: string | number;
  pajak: string;
  total: string | number;
}

export interface AnalysisResult {
  items: RabItem[];
  documentTotal: number;
  extractedTotal: number;
  difference: number;
}

export function cleanNumber(text: any): number {
  if (text === null || text === undefined) return 0.0;

  let textStr = String(text).replace(/\s/g, '').trim();

  // Handle Indonesian format: 1.234,56 -> 1234.56
  // Check if comma is decimal separator (comes after dots)
  if (textStr.includes(',') && textStr.lastIndexOf(',') > textStr.lastIndexOf('.')) {
    textStr = textStr.replace(/\./g, '').replace(',', '.');
  } else {
    // English format or mixed: remove commas
    textStr = textStr.replace(/,/g, '');
  }

  const match = textStr.match(/[\d\.]+/);
  if (match) {
    const val = parseFloat(match[0]);
    return isNaN(val) ? 0.0 : val;
  }
  return 0.0;
}

export function isTrulyNumeric(val: any): boolean {
  if (val === null || val === undefined || val === '') return false;
  const strVal = String(val);

  const cleaned = strVal.replace(/\s/g, '').replace(/\./g, '').replace(',', '.').trim();
  if (!/\d/.test(cleaned)) return false;

  const letters = (strVal.match(/[a-zA-Z]/g) || []).length;
  const digits = (strVal.match(/\d/g) || []).length;

  if (letters > digits && letters > 0) return false;
  return true;
}

export function formatCurrency(val: number): string {
  if (val === 0) return "0";
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function cleanText(text: any): string {
  if (text) {
    return String(text).replace(/\n/g, ' ').trim();
  }
  return "";
}

const TAX_RATE = 0.11;

export async function analyzeExcel(file: File): Promise<AnalysisResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true, cellNF: false, cellText: false });

        // Find RAB sheet
        const sheetName = workbook.SheetNames.find(n => n.includes('RAB')) || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Get hidden rows from worksheet properties
        const hiddenRows = new Set<number>();
        if (worksheet['!rows']) {
          worksheet['!rows'].forEach((row: any, idx: number) => {
            if (row && row.hidden) {
              hiddenRows.add(idx);
            }
          });
        }

        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

        const extractedData: RabItem[] = [];
        let colMap = { no: -1, item: -1, satuan: -1, vol: -1, harga: -1, jumlah: -1 };
        let inDetailSection = false;
        let inRekapSection = false;
        let documentTotal = 0;

        for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
          // Skip hidden rows
          if (hiddenRows.has(rowIdx)) continue;

          const row = rows[rowIdx];
          if (!row || row.length === 0) continue;


          const rowValsStr = row.map(val => String(val || '').toLowerCase().trim());

          // Section detection
          if (rowValsStr.some(v => v.includes('rekapitulasi'))) {
            inRekapSection = true;
            inDetailSection = false;
            continue;
          }

          if (rowValsStr.some(v => v.includes('rencana anggaran biaya')) && !rowValsStr.some(v => v.includes('rekapitulasi'))) {
            inRekapSection = false;
          }

          // Header Detection
          if (!inRekapSection) {
            let foundAny = false;
            rowValsStr.forEach((val, i) => {
              if (val === "no" || val === "no.") { colMap.no = i; foundAny = true; }
              if (val.includes("uraian") || val.includes("barang") || val.includes("pekerjaan")) { colMap.item = i; foundAny = true; }
              if (val === "sat" || val === "sat." || (val === "satuan" && colMap.satuan === -1)) { colMap.satuan = i; foundAny = true; }
              if (val.includes("vol") && colMap.vol === -1) { colMap.vol = i; foundAny = true; }
              if (val.includes("harga") && val.includes("satuan")) { colMap.harga = i; foundAny = true; }
              if (["jumlah", "total", "sub total", "subtotal"].includes(val) && colMap.jumlah === -1) { colMap.jumlah = i; foundAny = true; }
            });

            // Secondary price check
            if (colMap.harga === -1 && rowValsStr.includes("harga")) {
              const idx = rowValsStr.indexOf("harga");
              if (idx !== colMap.jumlah) { colMap.harga = idx; foundAny = true; }
            }

            if (colMap.item !== -1 && (colMap.vol !== -1 || colMap.jumlah !== -1)) {
              inDetailSection = true;
              const headerKeywords = ["no", "no.", "sat", "satuan", "vol", "volume", "uraian", "barang", "harga", "jumlah", "pekerjaan"];
              const keyCount = rowValsStr.filter(v => headerKeywords.includes(v)).length;
              if (foundAny && keyCount >= 2) continue;
            }
          }

          if (!inDetailSection) continue;

          const no = String(row[colMap.no] || '').trim();
          let itemName = String(row[colMap.item] || '').trim();

          // Item name merge logic (similar to Python)
          if (colMap.item !== -1) {
            for (let offset = 1; offset <= 2; offset++) {
              const currIdx = colMap.item + offset;
              if (currIdx >= row.length) break;
              const nextVal = String(row[currIdx] || '').trim();
              if (!nextVal) continue;

              const isMarker = !itemName || itemName.length <= 3 || /^\d+(\.\d+)*\.?$/.test(itemName) || itemName.endsWith('.');
              if (!itemName) {
                itemName = nextVal;
              } else if (isMarker) {
                itemName = `${itemName} ${nextVal}`;
              } else {
                break;
              }
            }
          }

          const lowerItem = itemName.toLowerCase();

          // Document total detection
          if (lowerItem.includes('total') || lowerItem.includes('jumlah total') || lowerItem.includes('dibulatkan')) {
            const potentialTotal = colMap.jumlah !== -1 ? Number(row[colMap.jumlah]) : 0;
            if (potentialTotal > documentTotal) {
              documentTotal = potentialTotal;
            }
          }

          if (!itemName || ["uraian pekerjaan", "sub jumlah", "ppn 11 %", "jumlah total pekerjaan fisik", "dibulatkan", "terbilang", "sub total", "subtotal"].includes(lowerItem)) {
            continue;
          }

          // Sequence Skipping (e.g., 1, 2, 3, 4, 5, 6 row)
          if (no === "1" && itemName === "2") {
            const possibleSat = String(row[colMap.satuan] || '').trim();
            if (possibleSat === "3") continue;
          }

          const isRoman = /^[IVXLC]+$/i.test(no);
          const satVal = String(row[colMap.satuan] || '-').trim();
          const volVal = typeof row[colMap.vol] === 'number' ? row[colMap.vol] : 0;
          const hargaVal = typeof row[colMap.harga] === 'number' ? row[colMap.harga] : 0;
          const excelJumlah = typeof row[colMap.jumlah] === 'number' ? row[colMap.jumlah] : 0;

          if (isRoman) {
            extractedData.push({ type: 'header', no, item: itemName, satuan: '-', vol: '-', harga: '-', pajak: '-', total: '-' });
            continue;
          }

          if ((volVal > 0 && hargaVal > 0) || (volVal > 0 && excelJumlah > 0)) {
            const subtotal = excelJumlah > 0 ? excelJumlah : (volVal * hargaVal);
            const totalWithTax = subtotal * (1 + TAX_RATE);
            const unitPrice = hargaVal || (volVal > 0 ? subtotal / volVal : 0);

            extractedData.push({
              type: 'item',
              no: no || '-',
              item: itemName,
              satuan: satVal,
              vol: volVal,
              harga: unitPrice,
              pajak: `${(TAX_RATE * 100).toFixed(0)}%`,
              total: totalWithTax
            });
          }
        }

        const extractedTotal = extractedData.reduce((acc, curr) => acc + (typeof curr.total === 'number' ? curr.total : 0), 0);

        resolve({
          items: extractedData,
          documentTotal: documentTotal,
          extractedTotal: extractedTotal,
          difference: Math.abs(documentTotal - extractedTotal)
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

export async function analyzePdf(file: File): Promise<AnalysisResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const extractedData: RabItem[] = [];
  let documentTotal = 0;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const lines: { [key: number]: any[] } = {};
    textContent.items.forEach((item: any) => {
      const y = Math.round(item.transform[5]);
      if (!lines[y]) lines[y] = [];
      lines[y].push(item);
    });

    const sortedYs = Object.keys(lines).map(Number).sort((a, b) => b - a);

    for (const y of sortedYs) {
      const rowItems = lines[y].sort((a, b) => a.transform[4] - b.transform[4]);
      const rowText = rowItems.map(item => item.str);

      const numsFromRight: number[] = [];
      const numIndices: number[] = [];
      for (let idx = rowText.length - 1; idx >= 0; idx--) {
        const txt = rowText[idx];
        if (isTrulyNumeric(txt)) {
          numsFromRight.push(cleanNumber(txt));
          numIndices.push(idx);
        }
      }

      if (numsFromRight.length < 2) {
        // Potential total in text-only row or poorly parsed row
        const fullText = rowText.join(' ').toLowerCase();
        if (fullText.includes('total') || fullText.includes('jumlah')) {
          const lastNum = numsFromRight[0] || 0;
          if (lastNum > documentTotal) documentTotal = lastNum;
        }
        continue;
      }

      const totalFromPdf = numsFromRight[0];
      const harga = numsFromRight[1];
      let volVal = 1.0;
      let noVal = "-";

      if (numsFromRight.length >= 4) {
        volVal = numsFromRight[3];
        noVal = numIndices[numIndices.length - 1] < 2 ? rowText[numIndices[numIndices.length - 1]] : "-";
      } else if (numsFromRight.length === 3) {
        volVal = numsFromRight[2];
        noVal = numIndices[numIndices.length - 1] < 2 ? rowText[numIndices[numIndices.length - 1]] : "-";
      }

      const textCells = rowText.filter((_, idx) => !numIndices.includes(idx)).map(t => t.trim()).filter(Boolean);
      let itemName = textCells.join(' ');
      let satuan = "-";

      if (itemName.toLowerCase().includes('total') || itemName.toLowerCase().includes('jumlah')) {
        if (totalFromPdf > documentTotal) documentTotal = totalFromPdf;
        continue;
      }

      const satuanKeywords = ['m2', 'm3', 'm\'', 'bh', 'ls', 'pkt', 'unit', 'set', 'ttk', 'kg', 'm1', 'btg', 'lbr', 'can'];
      if (textCells.length > 0) {
        const lastText = textCells[textCells.length - 1].toLowerCase();
        for (const kw of satuanKeywords) {
          if (lastText === kw || lastText.endsWith(" " + kw)) {
            satuan = kw;
            if (lastText === kw) {
              itemName = textCells.slice(0, -1).join(' ');
            } else {
              const baseText = textCells[textCells.length - 1].substring(0, textCells[textCells.length - 1].length - kw.length).trim();
              itemName = [...textCells.slice(0, -1), baseText].join(' ');
            }
            break;
          }
        }
      }

      if (!itemName) continue;

      const isRoman = /^[IVXLC]+$/i.test(noVal) || (/^[IVXLC]+$/i.test(rowText[0]) && (volVal === 0 || totalFromPdf === 0));

      if (isRoman) {
        extractedData.push({ type: 'header', no: rowText[0] || noVal, item: itemName, satuan: '-', vol: '-', harga: '-', pajak: '-', total: '-' });
        continue;
      }

      const subtotal = volVal * harga;
      const totalWithTax = subtotal * (1 + TAX_RATE);

      extractedData.push({
        type: 'item',
        no: noVal || '-',
        item: itemName,
        satuan: satuan,
        vol: volVal,
        harga: harga,
        pajak: `${(TAX_RATE * 100).toFixed(0)}%`,
        total: totalWithTax
      });
    }
  }

  const extractedTotal = extractedData.reduce((acc, curr) => acc + (typeof curr.total === 'number' ? curr.total : 0), 0);

  return {
    items: extractedData,
    documentTotal: documentTotal,
    extractedTotal: extractedTotal,
    difference: Math.abs(documentTotal - extractedTotal)
  };
}
