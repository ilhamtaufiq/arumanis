#!/usr/bin/env node
/**
 * Post-build smoke checks for Arumanis deploy gate.
 * Usage: bun run build && bun run smoke
 * Optional: SMOKE_BFF_URL=http://127.0.0.1:8787 bun run smoke
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const distDir = resolve(root, 'dist')
const checks = []

function pass(name, detail = '') {
    checks.push({ name, ok: true, detail })
}

function fail(name, detail) {
    checks.push({ name, ok: false, detail })
}

function checkDistArtifacts() {
    const indexHtml = resolve(distDir, 'index.html')
    const versionJson = resolve(distDir, 'version.json')

    if (!existsSync(indexHtml)) {
        fail('dist/index.html exists', 'Run bun run build first')
        return
    }
    pass('dist/index.html exists')

    const html = readFileSync(indexHtml, 'utf8')
    if (html.includes('app-build-id')) {
        pass('index.html embeds build metadata')
    } else {
        fail('index.html embeds build metadata', 'Missing app-build-id meta tag')
    }

    if (!existsSync(versionJson)) {
        fail('dist/version.json exists', 'version.json not generated')
        return
    }
    pass('dist/version.json exists')

    try {
        const version = JSON.parse(readFileSync(versionJson, 'utf8'))
        if (version.buildId && version.version) {
            pass('version.json is valid', `${version.version} @ ${version.buildId}`)
        } else {
            fail('version.json is valid', 'Missing buildId or version field')
        }
    } catch (error) {
        fail('version.json is valid', error instanceof Error ? error.message : String(error))
    }
}

async function checkBffHealth() {
    const baseUrl = process.env.SMOKE_BFF_URL?.replace(/\/$/, '')
    if (!baseUrl) {
        pass('BFF health (skipped)', 'Set SMOKE_BFF_URL to enable')
        return
    }

    try {
        const response = await fetch(`${baseUrl}/health/live`, {
            signal: AbortSignal.timeout(5000),
        })

        if (!response.ok) {
            fail('BFF /health/live', `HTTP ${response.status}`)
            return
        }

        const body = await response.json()
        if (body?.status === 'healthy' || body?.status === 'ok' || body?.alive === true) {
            pass('BFF /health/live', baseUrl)
        } else {
            fail('BFF /health/live', JSON.stringify(body))
        }
    } catch (error) {
        fail('BFF /health/live', error instanceof Error ? error.message : String(error))
    }
}

checkDistArtifacts()
await checkBffHealth()

const failed = checks.filter((check) => !check.ok)

console.log('\nArumanis smoke test\n')
for (const check of checks) {
    const icon = check.ok ? '✓' : '✗'
    const suffix = check.detail ? ` — ${check.detail}` : ''
    console.log(`${icon} ${check.name}${suffix}`)
}

if (failed.length > 0) {
    console.error(`\n${failed.length} check(s) failed`)
    process.exit(1)
}

console.log(`\nAll ${checks.length} checks passed`)