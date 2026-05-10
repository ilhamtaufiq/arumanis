export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function* streamAISummary(query: string, searchResults: any[]) {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (!apiKey) {
        throw new Error("VITE_OPENROUTER_API_KEY is not defined in environment variables");
    }

    const contextText = searchResults.slice(0, 10).map(item => {
        let details = `- [${item.type}] ${item.title}`;
        if (item.subtitle) details += `: ${item.subtitle}`;
        if (item.penyedia) details += ` (Penyedia: ${item.penyedia})`;
        if (item.nilai) details += ` (Nilai: Rp ${new Intl.NumberFormat('id-ID').format(item.nilai)})`;
        if (item.tahun) details += ` (Tahun: ${item.tahun})`;
        return details;
    }).join('\n');
    
    const requestBody = {
        model: import.meta.env.VITE_OPENROUTER_MODEL || "google/gemini-2.0-flash-lite-preview-02-05:free",
        messages: [
            {
                role: "system",
                content: "Anda adalah 'AmiSearch AI', asisten cerdas yang memberikan ringkasan eksekutif dan wawasan (insights) terhadap hasil pencarian di sistem Arumanis. \n\nTugas Anda:\n1. Berikan gambaran umum yang cerdas, bukan sekadar daftar ulang.\n2. Jika ada data Kontrak, sebutkan total anggaran atau tren penyedia yang dominan jika terlihat.\n3. Jika ada Progres, berikan gambaran kesehatan proyek secara keseluruhan.\n4. Gunakan gaya bahasa yang santai tapi profesional, natural, dan manusiawi.\n5. Jawab dalam Bahasa Indonesia yang fasih.\n6. Hindari format kaku. Jangan tampilkan proses berpikir logika internal."
            },
            {
                role: "user",
                content: `Berikut adalah 10 hasil pencarian teratas untuk kata kunci "${query}":\n\n${contextText}\n\nTolong berikan ringkasan yang informatif, temukan pola atau poin penting jika ada, dan sampaikan dengan cara yang menarik.`
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
