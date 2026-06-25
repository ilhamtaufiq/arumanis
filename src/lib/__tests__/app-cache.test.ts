import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    hasNewBuildAvailable,
    isAssetLoadError,
    isChunkLoadError,
    MAX_AUTO_RELOAD_ATTEMPTS,
} from '../app-cache'

describe('app-cache', () => {
    afterEach(() => {
        vi.unstubAllEnvs()
    })

    it('detects chunk load errors', () => {
        expect(isChunkLoadError(new Error('Failed to fetch dynamically imported module'))).toBe(true)
        expect(isChunkLoadError(new Error('Importing a module script failed'))).toBe(true)
        expect(isChunkLoadError(new Error('Something else'))).toBe(false)
    })

    it('detects broader asset load errors', () => {
        expect(isAssetLoadError(new Error('Failed to fetch dynamically imported module'))).toBe(true)
        expect(isAssetLoadError(new Error('Expected a JavaScript module script but the server responded with a MIME type of text/html'))).toBe(true)
        expect(isAssetLoadError(new Error('Network down'))).toBe(false)
    })

    it('detects new builds from remote manifest', () => {
        vi.stubEnv('DEV', false)

        const embedded = { version: '0.4.0', buildId: 'abc123', builtAt: '' }
        const remote = { version: '0.4.0', buildId: 'xyz789', builtAt: '' }

        expect(hasNewBuildAvailable(embedded, remote)).toBe(true)
        expect(hasNewBuildAvailable(embedded, embedded)).toBe(false)
        expect(hasNewBuildAvailable(embedded, { ...remote, buildId: 'dev' })).toBe(false)
    })

    it('limits automatic reload attempts', () => {
        expect(MAX_AUTO_RELOAD_ATTEMPTS).toBeGreaterThan(0)
    })
})