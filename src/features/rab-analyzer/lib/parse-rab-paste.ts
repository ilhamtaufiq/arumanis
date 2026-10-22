import * as XLSX from 'xlsx'
import type { RabParsedItem } from '../types'
import { parseIndonesianNumber } from './parse-indonesian-number'
import { isNegoWorkbook, parseNegoRows, parseNegoWorkbook } from './parse-nego'

function getImportText(value: unknown): string {
    if (value === null || value === undefined) return ''
    return String(value).replace(/\s+/g, ' ').trim()
}

function isSummaryText(value: string): boolean {
    const normalized = value.toLowerCase()
    return normalized.includes('sub total')
        || normalized.includes('sub jumlah')
        || normalized === 'jumlah'
        || normalized.includes('ppn')
        || normalized.includes('dibulatkan')
        || normalized.includes('dalam huruf')
        || normalized.includes('total harga')
}

const MCK_ROMAN_GROUP = /^(?:XIV|XIII|XII|XI|X|IX|VIII|VII|VI|V|IV|III|II|I)$/i
const MCK_LETTER_SUBGROUP = /^[A-Z]$/
const HIERARCHICAL_NUMBER = /^[\d]+(?:[.,][\d]+)+$/
const LOWER_LETTER_MARKER = /^[a-z]\.?$/
const UPPER_LETTER_SECTION = /^[A-Z]\.?$/

function normalizeUraian(value: string): string {
    return value
        .replace(/^["']+|["']+$/g, '')
        .replace(/^\-\s*/, '')
        .replace(/\s+/g, ' ')
        .trim()
}

function isMckHeaderRow(cells: unknown[]): boolean {
    const joined = cells.map((cell) => getImportText(cell).toLowerCase()).join(' ')
    return joined.includes('item pekerjaan')
        && joined.includes('satuan')
        && (joined.includes('harga satuan') || joined.includes('volume'))
}

function isSpamJpHeaderRow(cells: unknown[]): boolean {
    const joined = cells.map((cell) => getImportText(cell).toLowerCase()).join(' ')
    return joined.includes('uraian')
        && joined.includes('pekerjaan')
        && (joined.includes('sat') || joined.includes('volume') || joined.includes('jumlah'))
}

function isStructuredRabHeaderRow(cells: unknown[]): boolean {
    return isMckHeaderRow(cells) || isSpamJpHeaderRow(cells)
}

function isStructuredMetaRow(cells: unknown[]): boolean {
    const joined = cells.map((cell) => getImportText(cell).toLowerCase()).join(' ')
    if (!joined.trim()) return false
    return joined.includes('(rp)')
        || (joined.includes('satuan') && joined.includes('harga') && !findMckDataColumns(cells))
}

function isJumlahRow(cells: unknown[]): boolean {
    return cells.some((cell) => {
        const text = getImportText(cell).toLowerCase()
        return text === 'jumlah'
            || text.includes('sub jumlah')
            || text.includes('sub total')
    })
}

function looksLikeShortGroupHeader(text: string): boolean {
    if (!text || text.length > 80) return false
    if (isSummaryText(text)) return false
    if (/^(meliputi|pekerjaan pengadaan)/i.test(text)) return false
    if ((text.match(/,/g) ?? []).length >= 2) return false
    return /^[A-Z(]/.test(text)
}

type MckColumnLayout = {
    no: number
    desc: number
    satuan: number
    volume: number
    harga: number
}

const DEFAULT_MCK_LAYOUT: MckColumnLayout = {
    no: 0,
    desc: 1,
    satuan: 3,
    volume: 4,
    harga: 5,
}

function detectMckColumns(headerCells: unknown[]): MckColumnLayout {
    const labels = headerCells.map((cell, index) => ({
        index,
        text: getImportText(cell).toLowerCase(),
    }))

    const desc = labels.find((label) => (
        (label.text.includes('item') && label.text.includes('pekerjaan'))
        || (label.text.includes('uraian') && label.text.includes('pekerjaan'))
    ))?.index
    const satuan = labels.find((label) => label.text === 'satuan' || label.text === 'sat')?.index
        ?? labels.find((label) => label.text.includes('satuan') && !label.text.includes('harga'))?.index
    const volume = labels.find((label) => label.text === 'volume' || label.text.includes('volume'))?.index
    const harga = labels.find((label) => label.text.includes('harga satuan'))?.index
        ?? labels.find((label) => label.text === 'harga')?.index
    const no = labels.find((label) => label.text === 'no' || label.text === 'no.')?.index ?? 0

    if (desc === undefined || volume === undefined || harga === undefined) {
        return DEFAULT_MCK_LAYOUT
    }

    return {
        no,
        desc,
        satuan: satuan ?? volume - 2,
        volume,
        harga,
    }
}

function findMckDataColumns(cells: unknown[]): Pick<MckColumnLayout, 'satuan' | 'volume' | 'harga'> | null {
    for (let satuanIndex = 1; satuanIndex < cells.length - 2; satuanIndex += 1) {
        const satuan = getImportText(cells[satuanIndex])
        const volume = parseIndonesianNumber(cells[satuanIndex + 1])
        const hargaSatuan = parseIndonesianNumber(cells[satuanIndex + 2])

        if (!satuan || isSummaryText(satuan)) continue
        if (volume <= 0 || hargaSatuan <= 0) continue
        if (/^\d+$/.test(satuan)) continue

        return {
            satuan: satuanIndex,
            volume: satuanIndex + 1,
            harga: satuanIndex + 2,
        }
    }

    return null
}

type SectionFrame = {
    key: string
    label: string
    depth: number
}

function buildStructuredGroupLabel(mainGroup: string, sectionStack: SectionFrame[]): string {
    const parts = [mainGroup, ...sectionStack.map((section) => section.label)].filter(Boolean)
    return parts.join(' › ')
}

function hierarchicalDepth(marker: string): number {
    if (HIERARCHICAL_NUMBER.test(marker)) {
        return marker.split(/[.,]/).length
    }
    if (/^\d+$/.test(marker)) return 1
    if (LOWER_LETTER_MARKER.test(marker)) return 12
    if (UPPER_LETTER_SECTION.test(marker)) return 10
    return 0
}

function extractTitleBeforeData(cells: unknown[], startIndex: number, stopIndex: number): string {
    return cells
        .slice(startIndex, stopIndex)
        .map((cell) => getImportText(cell))
        .filter((text) => text && text !== '-' && text !== '"')
        .join(' ')
        .trim()
}

function resolveRowMarker(
    cells: unknown[],
    layout: MckColumnLayout,
    dataCols: Pick<MckColumnLayout, 'satuan' | 'volume' | 'harga'> | null,
): { marker: string; title: string; index: number } | null {
    const stopIndex = dataCols?.satuan ?? cells.length

    for (let index = 0; index < stopIndex; index += 1) {
        const marker = getImportText(cells[index])
        if (!marker || marker === '-') continue

        const isMarker = MCK_ROMAN_GROUP.test(marker)
            || HIERARCHICAL_NUMBER.test(marker)
            || /^\d+$/.test(marker)
            || LOWER_LETTER_MARKER.test(marker)
            || UPPER_LETTER_SECTION.test(marker)
            || MCK_LETTER_SUBGROUP.test(marker)

        if (!isMarker) continue

        const title = extractTitleBeforeData(cells, index + 1, stopIndex)
        return { marker, title, index }
    }

    const fallbackNo = getImportText(cells[layout.no])
    if (fallbackNo) {
        return {
            marker: fallbackNo,
            title: extractTitleBeforeData(cells, layout.desc, stopIndex),
            index: layout.no,
        }
    }

    return null
}

function pushSectionFrame(sectionStack: SectionFrame[], marker: string, title: string): SectionFrame[] {
    const label = title ? `${marker} ${title}`.trim() : marker
    const depth = hierarchicalDepth(marker)

    if (HIERARCHICAL_NUMBER.test(marker)) {
        return [
            ...sectionStack.filter((section) => section.depth < depth),
            { key: marker, label, depth },
        ]
    }

    if (/^\d+$/.test(marker)) {
        const lastSection = sectionStack[sectionStack.length - 1]
        if (
            lastSection
            && (
                lastSection.depth >= 1
                || UPPER_LETTER_SECTION.test(lastSection.key)
                || LOWER_LETTER_MARKER.test(lastSection.key)
                || HIERARCHICAL_NUMBER.test(lastSection.key)
            )
        ) {
            return [
                ...sectionStack,
                { key: marker, label, depth: lastSection.depth + 1 },
            ]
        }
        return [{ key: marker, label, depth: 1 }]
    }

    if (LOWER_LETTER_MARKER.test(marker)) {
        return [
            ...sectionStack.filter((section) => section.depth < 12),
            { key: marker, label, depth },
        ]
    }

    if (UPPER_LETTER_SECTION.test(marker) || MCK_LETTER_SUBGROUP.test(marker)) {
        return [
            ...sectionStack.filter((section) => section.depth < 10),
            { key: marker, label, depth },
        ]
    }

    return sectionStack
}

function looksLikeStructuredRab(rows: unknown[][]): boolean {
    return rows.some((row) => isStructuredRabHeaderRow(Array.isArray(row) ? row : []))
        || rows.some((row) => {
            const cells = Array.isArray(row) ? row : []
            const marker = getImportText(cells[0])
            const title = getImportText(cells[1])
            return MCK_ROMAN_GROUP.test(marker) && Boolean(title)
        })
}

function parseMckRabRows(rows: unknown[][]): RabParsedItem[] {
    let layout = DEFAULT_MCK_LAYOUT
    let currentMainGroup = 'Tanpa Kategori'
    let sectionStack: SectionFrame[] = []
    let pendingDesc = ''
    const items: RabParsedItem[] = []

    const pushItem = (
        uraian: string,
        satuan: string,
        volume: number,
        hargaSatuan: number,
    ) => {
        const normalizedUraian = normalizeUraian(uraian)
        if (!normalizedUraian || !satuan || volume <= 0 || hargaSatuan <= 0) return

        items.push({
            grup: buildStructuredGroupLabel(currentMainGroup, sectionStack),
            uraian: normalizedUraian,
            satuan,
            volume,
            hargaSatuan,
        })
    }

    rows.forEach((row) => {
        const cells = Array.isArray(row) ? row : []
        if (cells.every((cell) => !getImportText(cell))) return

        if (isStructuredRabHeaderRow(cells)) {
            layout = detectMckColumns(cells)
            return
        }

        if (isStructuredMetaRow(cells) || isJumlahRow(cells)) {
            pendingDesc = ''
            return
        }

        const nonEmptyCells = cells
            .map((cell) => getImportText(cell))
            .filter(Boolean)

        if (nonEmptyCells.length === 1 && parseIndonesianNumber(nonEmptyCells[0]) >= 100000) {
            return
        }

        const dataCols = findMckDataColumns(cells)
        const resolvedMarker = resolveRowMarker(cells, layout, dataCols)

        if (dataCols) {
            const descStop = dataCols.satuan
            const descStart = resolvedMarker ? resolvedMarker.index + 1 : 0
            const descParts = cells
                .slice(descStart, descStop)
                .map((cell) => getImportText(cell))
                .filter((text) => text && text !== '-' && text !== '"')

            const uraian = [pendingDesc, ...descParts].filter(Boolean).join(' ')
            const satuan = getImportText(cells[dataCols.satuan])
            const volume = parseIndonesianNumber(cells[dataCols.volume])
            const hargaSatuan = parseIndonesianNumber(cells[dataCols.harga])

            pushItem(uraian, satuan, volume, hargaSatuan)
            pendingDesc = ''
            return
        }

        if (!resolvedMarker) {
            if (pendingDesc) {
                const extra = extractTitleBeforeData(cells, 0, cells.length)
                if (extra) pendingDesc = `${pendingDesc} ${extra}`.trim()
                return
            }

            const narrativeTitle = extractTitleBeforeData(cells, 0, cells.length)
            if (looksLikeShortGroupHeader(narrativeTitle)) {
                currentMainGroup = narrativeTitle
                sectionStack = []
            }
            return
        }

        const { marker, title } = resolvedMarker

        if (MCK_ROMAN_GROUP.test(marker)) {
            currentMainGroup = title || marker
            sectionStack = []
            pendingDesc = ''
            return
        }

        if (/^\d+$/.test(marker) && title) {
            const quoteCount = (title.match(/"/g) ?? []).length
            if (quoteCount % 2 === 1) {
                pendingDesc = title
                return
            }
        }

        sectionStack = pushSectionFrame(sectionStack, marker, title)
        pendingDesc = ''
    })

    return items
}

function firstMeaningfulImportText(cells: unknown[], indexes: number[]): string {
    for (const index of indexes) {
        const text = getImportText(cells[index])
        if (text && text !== '-' && text !== ':' && !/^rp\.?$/i.test(text)) {
            return text
        }
    }
    return ''
}

function hasMeaningfulText(value: string): boolean {
    return value !== '' && value !== '-' && value !== ':' && !/^rp\.?$/i.test(value)
}

function parseLegacyImportRows(rows: unknown[][]): RabParsedItem[] {
    let currentGroup = 'Tanpa Kategori'
    let currentLocation = ''
    const newItems: RabParsedItem[] = []

    rows.forEach((row) => {
        const cells = Array.isArray(row) ? row : []
        if (cells.length === 0) return

        const isGroup = cells[cells.length - 1] === true || cells[cells.length - 1] === 'true'
        const desc = getImportText(cells[0])
        const vol = parseIndonesianNumber(cells[2])
        const price = parseIndonesianNumber(cells[3])

        if (isGroup) {
            const categoryName = desc || 'Tanpa Kategori'
            if (currentLocation && currentLocation !== categoryName) {
                currentGroup = `${currentLocation} - ${categoryName}`
            } else {
                currentGroup = categoryName
            }
            return
        }

        if (!desc || desc === '0') return

        if (price === 0) {
            currentLocation = desc
            currentGroup = desc
            return
        }

        newItems.push({
            grup: currentGroup,
            uraian: desc,
            satuan: getImportText(cells[1]) || '-',
            volume: vol,
            hargaSatuan: price,
        })
    })

    return newItems
}

function parseAirMinumRabRows(rows: unknown[][]): RabParsedItem[] {
    let currentGroup = 'Tanpa Kategori'
    const newItems: RabParsedItem[] = []
    const layouts = [
        { textStart: 1, satuan: 6, volume: 7, harga: 8 },
        { textStart: 0, satuan: 5, volume: 6, harga: 7 },
        { textStart: 0, satuan: 4, volume: 5, harga: 6 },
    ]

    rows.forEach((row) => {
        const cells = Array.isArray(row) ? row : []
        const layout = layouts.find((candidate) => {
            const satuan = getImportText(cells[candidate.satuan])
            const volume = parseIndonesianNumber(cells[candidate.volume])
            const hargaSatuan = parseIndonesianNumber(cells[candidate.harga])
            return satuan && volume > 0 && hargaSatuan > 0
        }) || layouts[0]

        const textIndexes = [
            layout.textStart,
            layout.textStart + 1,
            layout.textStart + 2,
            layout.textStart + 3,
            layout.textStart + 4,
        ]
        const groupDesc = firstMeaningfulImportText(cells, textIndexes)
        const itemDesc = firstMeaningfulImportText(cells, [
            layout.textStart + 1,
            layout.textStart,
            layout.textStart + 2,
            layout.textStart + 3,
            layout.textStart + 4,
        ])
        const satuan = getImportText(cells[layout.satuan])
        const volume = parseIndonesianNumber(cells[layout.volume])
        const hargaSatuan = parseIndonesianNumber(cells[layout.harga])

        if (!groupDesc || isSummaryText(groupDesc)) return

        if (!satuan && volume === 0 && hargaSatuan === 0) {
            currentGroup = groupDesc
            return
        }

        if (itemDesc && satuan && volume > 0 && hargaSatuan > 0) {
            newItems.push({
                grup: currentGroup,
                uraian: itemDesc,
                satuan,
                volume,
                hargaSatuan,
            })
        }
    })

    return newItems
}

function parseDhspRows(rows: unknown[][], groupName: string): RabParsedItem[] {
    const newItems: RabParsedItem[] = []
    const layouts = [
        { desc: 3, volume: 4, harga: 5 },
        { desc: 2, volume: 3, harga: 4 },
        { desc: 1, volume: 2, harga: 3 },
    ]

    rows.forEach((row) => {
        const cells = Array.isArray(row) ? row : []
        const layout = layouts.find((candidate) => {
            const desc = getImportText(cells[candidate.desc])
            const volume = parseIndonesianNumber(cells[candidate.volume])
            const hargaSatuan = parseIndonesianNumber(cells[candidate.harga])
            return hasMeaningfulText(desc) && volume > 0 && hargaSatuan > 0
        }) || layouts[0]
        const desc = getImportText(cells[layout.desc])
        const volume = parseIndonesianNumber(cells[layout.volume])
        const hargaSatuan = parseIndonesianNumber(cells[layout.harga])

        if (!desc || isSummaryText(desc) || volume <= 0 || hargaSatuan <= 0) return

        newItems.push({
            grup: groupName,
            uraian: desc,
            satuan: '-',
            volume,
            hargaSatuan,
        })
    })

    return newItems
}

export function parseBestImportRows(rows: unknown[][], groupName = 'Tanpa Kategori'): RabParsedItem[] {
    // Coba format Hasil Nego dulu (paste / sheet tanpa nama Nego)
    const negoItems = parseNegoRows(rows)
    if (negoItems.length > 0) {
        const structured = looksLikeStructuredRab(rows) ? parseMckRabRows(rows) : []
        // Prefer nego jika lebih banyak item valid (harga nego)
        if (negoItems.length >= structured.length) return negoItems
        if (structured.length > 0) return structured
        return negoItems
    }

    if (looksLikeStructuredRab(rows)) {
        const structuredItems = parseMckRabRows(rows)
        if (structuredItems.length > 0) return structuredItems
    }

    const candidates = [
        parseMckRabRows(rows),
        parseAirMinumRabRows(rows),
        parseDhspRows(rows, groupName),
        parseLegacyImportRows(rows),
    ]

    return candidates.reduce(
        (best, current) => (current.length > best.length ? current : best),
        [] as RabParsedItem[],
    )
}

function findWorksheetByName(workbook: XLSX.WorkBook, patterns: RegExp[]) {
    const sheetName = workbook.SheetNames.find((name) => patterns.some((pattern) => pattern.test(name)))
    if (!sheetName) return null

    return {
        sheetName,
        rows: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: null }) as unknown[][],
    }
}

export function parseRabWorkbook(workbook: XLSX.WorkBook): RabParsedItem[] {
    // Prioritas: file Hasil Nego (sheet "Nego") — harga dari kolom Negosiasi
    if (isNegoWorkbook(workbook)) {
        const negoItems = parseNegoWorkbook(workbook)
        if (negoItems.length > 0) return negoItems
    }

    const rabSheet = findWorksheetByName(workbook, [/^rab$/i])
    if (rabSheet) {
        const rabItems = parseAirMinumRabRows(rabSheet.rows)
        if (rabItems.length > 0) return rabItems
    }

    const dhspSheet = findWorksheetByName(workbook, [/^harsat/i, /harga\s*satuan/i])
    if (dhspSheet) {
        const dhspItems = parseDhspRows(dhspSheet.rows, dhspSheet.sheetName)
        if (dhspItems.length > 0) return dhspItems
    }

    const firstSheetName = workbook.SheetNames[0]
    const firstSheet = workbook.Sheets[firstSheetName]
    const firstRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: null }) as unknown[][]
    return parseBestImportRows(firstRows, firstSheetName)
}

export function parseRabPasteText(text: string): unknown[][] {
    return text
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => line.split('\t').map((cell) => {
            const trimmed = cell.trim()
            if (trimmed.toLowerCase() === 'true') return true
            if (trimmed.toLowerCase() === 'false') return false
            return trimmed
        }))
}

export function parseRabPaste(text: string): RabParsedItem[] {
    const rows = parseRabPasteText(text)
    return parseBestImportRows(rows)
}

export function mapRabItemsToProgressImport(items: RabParsedItem[]) {
    const importedAt = Date.now()

    return items.map((item, index) => ({
        id: `import-${importedAt}-${index}`,
        nama_item: item.grup,
        rincian_item: item.uraian,
        satuan: item.satuan,
        target_volume: item.volume,
        harga_satuan: item.hargaSatuan,
        bobot: 0,
        weekly_data: {} as Record<string, unknown>,
    }))
}