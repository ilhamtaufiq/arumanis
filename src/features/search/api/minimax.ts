export const MINIMAX_API_URL = 'https://api.minimax.io/v1/chat/completions';

export async function* streamAISummary(query: string, searchResults: any[]) {
    // You should add this API key in your .env.local file
    const apiKey = import.meta.env.VITE_MINIMAX_API_KEY;
    
    if (!apiKey) {
        throw new Error("VITE_MINIMAX_API_KEY is not defined in environment variables");
    }

    const contextText = searchResults.slice(0, 5).map(item => `- [${item.type}] ${item.title}: ${item.subtitle}`).join('\n');
    
    const requestBody = {
        model: "MiniMax-M2.7", // Menggunakan model default M2.7
        messages: [
            {
                role: "system",
                content: "Anda adalah 'AmiSearch AI', asisten cerdas yang membantu pengguna di sistem internal Arumanis. Jawablah dengan gaya bahasa yang santai, natural, ringkas, dan manusiawi (seperti rekan kerja yang sedang menjelaskan laporan kepada atasannya). CRITICAL INSTRUCTION: You must strictly answer ONLY in 100% fluent Bahasa Indonesia. Do NOT use any foreign words, Chinese characters (Hanzi), Arabic, or any non-Latin scripts. JANGAN gunakan format kaku seperti 'Kesimpulan' atau poin-poin panjang. JANGAN tampilkan proses berpikir logika internal atau blok <think>. Berikan jawaban dalam bentuk percakapan pendek yang langsung pada intinya."
            },
            {
                role: "user",
                content: `Konteks pencarian untuk kata kunci "${query}":\n\n${contextText}\n\nTolong kasih saya penjelasan singkat, padat, dan natural tentang data apa saja yang ditemukan di atas logikanya.`
            }
        ],
        stream: true
    };

    const response = await fetch(MINIMAX_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const err = await response.text().catch(() => '');
        throw new Error(`MiniMax API error: ${response.status} ${err}`);
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
