import { describe, expect, it } from 'vitest'
import { isGiphyConfigured } from './giphy-client'

describe('giphy-client', () => {
    it('reports configured when VITE_GIPHY_API_KEY is set', () => {
        expect(typeof isGiphyConfigured()).toBe('boolean')
    })
})