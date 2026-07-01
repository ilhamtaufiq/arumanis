import { GiphyFetch } from '@giphy/js-fetch-api'

let giphyFetch: GiphyFetch | null = null

export function isGiphyConfigured(): boolean {
    const key = import.meta.env.VITE_GIPHY_API_KEY
    return typeof key === 'string' && key.trim().length > 0
}

export function getGiphyFetch(): GiphyFetch | null {
    const key = import.meta.env.VITE_GIPHY_API_KEY?.trim()
    if (!key) return null

    if (!giphyFetch) {
        giphyFetch = new GiphyFetch(key)
    }

    return giphyFetch
}