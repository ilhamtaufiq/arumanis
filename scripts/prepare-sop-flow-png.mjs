#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROW_H, excelColsToPx, ensureFlowPng } from './sop-flow-utils.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const JSON_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '.sop-export.json')
const SVG_DIR = resolve(ROOT, 'docs', 'sop-flow')
const PNG_DIR = resolve(ROOT, 'docs', 'sop-flow-png')

/** Harus sama dengan kolom C–F di generate-sop-xlsx.py */
const XLSX_PEL_COL_CHARS = [6, 6, 6, 6]
const pelaksanaPxW = excelColsToPx(XLSX_PEL_COL_CHARS)

const data = JSON.parse(readFileSync(JSON_PATH, 'utf8'))
let ok = 0
for (const sop of data.sops) {
    const h = sop.steps.length * ROW_H
    if (ensureFlowPng(sop.slug, sop.steps.length, SVG_DIR, PNG_DIR, pelaksanaPxW, h)) ok++
}
console.log(`✓ Flow PNG (${pelaksanaPxW}px × baris×${ROW_H}px): ${PNG_DIR} (${ok}/${data.sops.length})`)