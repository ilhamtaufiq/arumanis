import '@testing-library/jest-dom'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => false,
    }),
})

// Mock ResizeObserver
Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: class ResizeObserver {
        observe() { }
        unobserve() { }
        disconnect() { }
    }
})

// Mock IntersectionObserver
Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: class IntersectionObserver {
        root = null
        rootMargin = ''
        thresholds: number[] = []
        observe() { }
        unobserve() { }
        disconnect() { }
        takeRecords() { return [] }
    }
})
