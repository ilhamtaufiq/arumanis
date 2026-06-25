type SearchResultItem = {
    type?: string
    title?: string
    subtitle?: string
    penyedia?: string
    nilai?: number
    tahun?: number | string | null
}

export async function* streamAISummary(query: string, searchResults: SearchResultItem[]) {
    const response = await fetch('/bff/api/search/ai-summary', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
        },
        body: JSON.stringify({
            query,
            results: searchResults.slice(0, 10),
        }),
    })

    if (!response.ok) {
        const err = await response.text().catch(() => '')
        throw new Error(`AI summary error: ${response.status} ${err}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
            const trimmedLine = line.trim()
            if (!trimmedLine.startsWith('data:')) continue

            const dataStr = trimmedLine.slice(5).trim()
            if (dataStr === '[DONE]') continue

            try {
                const parsed = JSON.parse(dataStr)
                if (parsed.content) {
                    yield parsed.content as string
                }
            } catch {
                // Ignore malformed SSE chunks
            }
        }
    }
}