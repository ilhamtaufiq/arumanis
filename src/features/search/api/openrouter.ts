export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function* streamAISummary(query: string, searchResults: any[]) {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (!apiKey) {
        throw new Error("VITE_OPENROUTER_API_KEY is not defined in environment variables");
    }

    const contextText = searchResults.slice(0, 5).map(item => `- [${item.type}] ${item.title}: ${item.subtitle}`).join('\n');
    
    const requestBody = {
        model: "nvidia/nemotron-3-super-120b-a12b:free",
        messages: [
            {
                role: "system",
                content: "Anda adalah 'AmiSearch AI', asisten cerdas yang membantu pengguna di sistem internal Arumanis. Jawablah dengan gaya bahasa yang santai, natural, ringkas, dan manusiawi (seperti rekan kerja yang sedang menjelaskan laporan kepada atasannya). CRITICAL INSTRUCTION: You must strictly answer ONLY in 100% fluent Bahasa Indonesia. Do NOT use any foreign words. JANGAN gunakan format kaku seperti 'Kesimpulan' atau poin-poin panjang. JANGAN tampilkan proses berpikir logika internal atau blok <think>. Berikan jawaban dalam bentuk percakapan pendek yang langsung pada intinya."
            },
            {
                role: "user",
                content: `Konteks pencarian untuk kata kunci "${query}":\n\n${contextText}\n\nTolong kasih saya penjelasan singkat, padat, dan natural tentang data apa saja yang ditemukan di atas logikanya.`
            }
        ],
        stream: true
    };

    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Arumanis Search'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const err = await response.text().catch(() => '');
        throw new Error(`OpenRouter API error: ${response.status} ${err}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: ')) {
                const dataStr = trimmedLine.slice(6).trim();
                
                if (dataStr === '[DONE]') continue;
                
                try {
                    const parsed = JSON.parse(dataStr);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                        yield content;
                    }
                } catch (e) {
                    // Ignore JSON parse errors for incomplete chunks
                }
            }
        }
    }
}
