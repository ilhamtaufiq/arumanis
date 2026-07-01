#!/usr/bin/env node
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ALL_SOPS, SOP_KETERANGAN } from './sop-modules-data.mjs'

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '.sop-export.json')

writeFileSync(
    OUT,
    JSON.stringify(
        {
            version: '1.1',
            date: '1 Juli 2026',
            total: ALL_SOPS.length,
            keterangan: SOP_KETERANGAN,
            sops: ALL_SOPS,
        },
        null,
        2,
    ),
    'utf8',
)
console.log(`✓ SOP JSON: ${OUT} (${ALL_SOPS.length} lembar)`)