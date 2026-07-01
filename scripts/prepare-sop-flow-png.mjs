#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ensureFlowPng } from './sop-flow-utils.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const JSON_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '.sop-export.json')
const SVG_DIR = resolve(ROOT, 'docs', 'sop-flow')
const PNG_DIR = resolve(ROOT, 'docs', 'sop-flow-png')

const data = JSON.parse(readFileSync(JSON_PATH, 'utf8'))
let ok = 0
for (const sop of data.sops) {
    if (ensureFlowPng(sop.slug, sop.steps.length, SVG_DIR, PNG_DIR)) ok++
}
console.log(`✓ Flow PNG: ${PNG_DIR} (${ok}/${data.sops.length})`)