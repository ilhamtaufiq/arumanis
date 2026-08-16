# Plan & Progress: Fix RAG + Refactor Tool Calling ke LLM Function-Calling

> Status: **PLAN DISETUJUI, BELUM IMPLEMENTASI** — session dihentikan saat mau mulai coding.
> Resume dari sini saat lanjut.

## Context

Ami AI Assistant punya 2 masalah utama:

1. **RAG selalu fallback** — `scripts/rag_query.py` tidak ada, `retrieveKnowledge()` selalu return `"Pengetahuan sistem belum tersedia."`. Padahal ChromaDB sudah ada di `storage/ai/vector_db/` dengan 118 dokumen di collection `langchain`.

2. **Tool calling broken untuk local provider** — `shouldUseDirectHttp()` return true hanya untuk non-dynamic query (tanpa tools). Untuk dynamic query, fallback ke `chatWithLangChain()` yang panggil `scripts/chat_langchain.py` — script ini juga tidak ada. Akibatnya semua query data (pakai tool) gagal.

3. **Tool hints redundant** — `buildToolHints()` kasih keyword-based routing hints ke LLM. Padahal tools sudah dalam format OpenAI function-calling — LLM bisa pilih sendiri.

## Lingkup: Local Provider Only

Fokus ke local provider (yang selalu dipakai via `9router.cianjur.space`). LangChain bridge dan provider rotation tidak disentuh — tetap ada untuk backward compatibility.

---

## Priority 1: Fix RAG (Embedding-Based Semantic Search)

### 1.1 Create `scripts/rag_query.py`

**Path:** `C:\laragon\www\apiamis\scripts\rag_query.py`

Script menerima JSON via stdin (`{"query": "...", "n_results": 5}`), query ChromaDB, return JSON via stdout.

```python
import sys, json
sys.stdout.reconfigure(encoding='utf-8')

input_data = json.loads(sys.stdin.read())
query = input_data.get('query', '')
n_results = input_data.get('n_results', 5)

import chromadb
client = chromadb.PersistentClient(path='storage/ai/vector_db')
collection = client.get_collection('langchain')
results = collection.query(query_texts=[query], n_results=n_results)

chunks = []
for i, doc in enumerate(results['documents'][0]):
    meta = results['metadatas'][0][i] if results['metadatas'] else {}
    source = meta.get('source', 'unknown')
    chunks.append(f"--- {source} ---\n{doc}")

content = '\n\n'.join(chunks) if chunks else 'Pengetahuan sistem masih kosong.'
print(json.dumps({'content': content, 'chunks': chunks, 'error': None}, ensure_ascii=False))
```

Edge cases:
- Collection not found → `{"error": "Koleksi tidak ditemukan"}`
- First run download embedding model (~80MB ONNX) → PHP timeout 30s cukup setelah model cached
- Empty query → tetap search, ChromaDB handles

### 1.2 Update `ChatRagContextService::retrieveKnowledge()`

**File:** `app/Services/ChatRagContextService.php` lines 18-45

Changes:
- Timeout: `8` → `30` (first run perlu download model embedding)
- Check `$payload['error']` after JSON decode
- Log stderr on failure

```php
$result = Process::input(json_encode(['query' => $query]))
    ->timeout(30)  // was 8
    ->run([$pythonPath, $scriptPath]);

if ($result->failed()) {
    \Log::warning('RAG query failed', ['stderr' => $result->errorOutput()]);
    return 'Gagal mengambil pengetahuan sistem.';
}

$payload = json_decode($result->output(), true);
if (isset($payload['error'])) {
    \Log::warning('RAG query error', ['error' => $payload['error']]);
    return 'Pengetahuan sistem belum tersedia.';
}

return is_array($payload) ? (string) ($payload['content'] ?? '') : '';
```

---

## Priority 2: Refactor Tool Calling ke LLM Function-Calling

### 2.1 Add tools support to `streamDirect()`

**File:** `app/Services/OpenRouterService.php` lines 663-750

A. Add `tools` and `tool_choice` to payload (after line 668):
```php
if (isset($options['tools'])) {
    $payload['tools'] = $options['tools'];
    $payload['tool_choice'] = $options['tool_choice'] ?? 'auto';
}
```

B. Accumulate `tool_calls` from streaming deltas. Initialize `$toolCalls = []` at top of try block (line 683).

```php
// Accumulate tool_calls from streaming
$deltaToolCalls = $parsed['choices'][0]['delta']['tool_calls'] ?? null;
if (is_array($deltaToolCalls)) {
    foreach ($deltaToolCalls as $tc) {
        $idx = $tc['index'] ?? 0;
        if (!isset($toolCalls[$idx])) {
            $toolCalls[$idx] = [
                'id' => $tc['id'] ?? '',
                'type' => 'function',
                'function' => ['name' => '', 'arguments' => ''],
            ];
        }
        if (!empty($tc['id'])) $toolCalls[$idx]['id'] = $tc['id'];
        if (!empty($tc['function']['name'] ?? null)) $toolCalls[$idx]['function']['name'] = $tc['function']['name'];
        if (isset($tc['function']['arguments'])) $toolCalls[$idx]['function']['arguments'] .= $tc['function']['arguments'];
    }
}
```

C. Include `tool_calls` in return value:
```php
return [
    'success' => true,
    'content' => $content,
    'tool_calls' => !empty($toolCalls) ? array_values($toolCalls) : null,
    'model' => $responseModel,
    'usage' => $usage,
];
```

### 2.2 Refactor `chat()` (non-streaming)

**File:** `app\Http\Controllers\ChatController.php` lines 237-278

Replace the current flow with standard OpenAI tool-calling pattern:

```php
// Build messages with tools
$tools = $this->getToolsDefinition();
$messages = $this->openRouter->buildChatMessages($systemPrompt, $formattedHistory, $userMessage);

$finalResult = null;
$loopCount = 0;
$maxLoops = 3;

while ($loopCount < $maxLoops) {
    $result = $this->openRouter->chatDirect($requestedProvider, $messages, [
        'tools' => $tools,
        'tool_choice' => 'auto',
    ]);

    if (!$result['success']) {
        $finalResult = $result;
        break;
    }

    if (empty($result['tool_calls'])) {
        $finalResult = $result;
        break;
    }

    // Append assistant message with tool_calls
    $messages[] = [
        'role' => 'assistant',
        'content' => $result['content'] ?? '',
        'tool_calls' => $result['tool_calls'],
    ];

    // Execute tools and append results
    $toolResults = $this->resolveToolResults($result['tool_calls']);
    foreach ($toolResults as $tr) {
        $messages[] = $tr;
    }

    $loopCount++;
}
```

Key changes:
- Remove `$generationOptions`, `$toolHistory` — tidak perlu lagi
- Remove `shouldUseDirectHttp()` call — langsung pakai `chatDirect()` dengan tools
- Remove `chatWithLangChain()` call — tidak perlu
- `resolveToolResults()` sudah support OpenAI format (`function.name`/`function.arguments`)

### 2.3 Refactor `chatStream()` (streaming)

**File:** `app\Http\Controllers\ChatController.php` lines 422-501

Replace the current flow:

```php
$messages = $this->openRouter->buildChatMessages($systemPrompt, $formattedHistory, $userMessage);

// Stream with tools
$streamResult = $this->openRouter->streamDirect(
    $requestedProvider,
    $messages,
    function (string $token) use ($emit): void {
        $emit(['type' => 'token', 'content' => $token]);
    },
    ['tools' => $tools, 'tool_choice' => 'auto']
);

if (!($streamResult['success'] ?? false) && empty($streamResult['tool_calls'])) {
    $emit(['type' => 'error', 'message' => $streamResult['message'] ?? 'Streaming gagal']);
    return;
}

$finalResult = $streamResult;

// Tool loop (max 3 total calls)
if (!empty($streamResult['tool_calls'])) {
    $emit(['type' => 'status', 'message' => 'Mengambil data dari database...']);
    
    $messages[] = [
        'role' => 'assistant',
        'content' => $streamResult['content'] ?? '',
        'tool_calls' => $streamResult['tool_calls'],
    ];
    
    $toolResults = $this->resolveToolResults($streamResult['tool_calls']);
    foreach ($toolResults as $tr) {
        $messages[] = $tr;
    }
    
    $loopCount = 1;
    $maxLoops = 3;
    
    while ($loopCount < $maxLoops) {
        $secondResult = $this->openRouter->chatDirect($requestedProvider, $messages, [
            'tools' => $tools,
            'tool_choice' => 'auto',
        ]);
        
        if (!$secondResult['success']) break;
        
        if (empty($secondResult['tool_calls'])) {
            $finalResult = $secondResult;
            break;
        }
        
        $messages[] = [
            'role' => 'assistant',
            'content' => $secondResult['content'] ?? '',
            'tool_calls' => $secondResult['tool_calls'],
        ];
        $toolResults = $this->resolveToolResults($secondResult['tool_calls']);
        foreach ($toolResults as $tr) {
            $messages[] = $tr;
        }
        $loopCount++;
    }
    
    // Emit final content as tokens
    $finalContent = $finalResult['content'] ?? '';
    foreach (preg_split('/(\s+)/u', $finalContent, -1, PREG_SPLIT_DELIM_CAPTURE) as $chunk) {
        if ($chunk !== '') {
            $emit(['type' => 'token', 'content' => $chunk]);
        }
    }
}
```

Remove:
- `$payload`, `$generationOptions`, `$toolHistory`, `$runtime`
- `$this->langChainBridge->stream()` call
- `shouldUseDirectHttp()` + `isUsableDirectResult()` checks
- The fallback block that calls `langChainBridge->stream()`

### 2.4 Remove `buildToolHints()` from `buildContext()`

**File:** `app/Services/ChatRagContextService.php` lines 103-124

Remove lines 107-110 (the `buildToolHints()` call). Keep `buildToolHints()` as dead code.

### 2.5 Remove dead methods

**File:** `app\Http\Controllers\ChatController.php`

Remove:
- `shouldUseDirectHttp()` (lines 613-617)
- `isUsableDirectResult()` (lines 619-626)
- `containsFakeToolCallSyntax()` (lines 628-635)

---

## Files Modified

| File | Action |
|---|---|
| `scripts/rag_query.py` | **CREATE** — ChromaDB semantic search script |
| `app/Services/ChatRagContextService.php` | Timeout 8→30, error handling di `retrieveKnowledge()`, remove tool hints dari `buildContext()` |
| `app/Services/OpenRouterService.php` | Add `tools`/`tool_choice` + `tool_calls` accumulation ke `streamDirect()` |
| `app/Http/Controllers/ChatController.php` | Refactor `chat()` dan `chatStream()` ke LLM function-calling, remove dead methods |

## Verification

1. **RAG:** `echo '{"query":"Apa itu Arumanis?"}' | ./venv/Scripts/python.exe scripts/rag_query.py` → harus return JSON dengan `content` berisi potongan docs
2. **Chat non-tool:** `POST /api/chat {"message":"Halo"}` → streaming response, tidak ada tool calls
3. **Chat dengan tool:** `POST /api/chat {"message":"Berapa total pekerjaan tahun 2025?"}` → LLM panggil `get_statistics`, tool execute, LLM jawab dengan data
4. **Chat multi-tool:** `POST /api/chat {"message":"Cari paket air bersih"}` → `search_projects` → `get_project_details`
5. **Chat stream:** `POST /api/chat/stream {"message":"Berapa total pekerjaan?"}` → SSE events: `token`... `status` (tool executing) ... `token` (final answer) ... `done`

---

## Progress Posisi Terakhir (2026-08-13)

### Selesai
- ✅ Eksplorasi codebase lengkap (3 Explore agents + verifikasi manual)
- ✅ Verifikasi: ChromaDB ada (`storage/ai/vector_db/`, collection `langchain`, 118 dokumen)
- ✅ Verifikasi: `venv/Scripts/python.exe` ada, `chromadb` terinstall
- ✅ Verifikasi: `scripts/` directory TIDAK ada (perlu dibuat)
- ✅ Plan disetujui user

### Belum (Next Steps)
- [ ] Create `scripts/rag_query.py` (Priority 1)
- [ ] Update `ChatRagContextService::retrieveKnowledge()` — timeout 8→30 + error handling
- [ ] Add tools support ke `OpenRouterService::streamDirect()`
- [ ] Refactor `ChatController::chat()` ke LLM function-calling
- [ ] Refactor `ChatController::chatStream()` ke LLM function-calling
- [ ] Remove `buildToolHints()` dari `buildContext()`
- [ ] Remove dead methods (`shouldUseDirectHttp`, `isUsableDirectResult`, `containsFakeToolCallSyntax`)
- [ ] Verifikasi end-to-end (RAG + tool calling)

### Key Facts yang Sudah Diverifikasi
- `ChatRagContextService::retrieveKnowledge()` → lines 18-45, timeout 8s, panggil `scripts/rag_query.py`
- `ChatController::chat()` → lines 237-278 (tool loop via `chatWithLangChain`)
- `ChatController::chatStream()` → lines 422-501 (tool loop via `langChainBridge->stream()`)
- `OpenRouterService::streamDirect()` → lines 639-760, payload tanpa `tools`
- `ChatController::shouldUseDirectHttp()` → lines 613-617
- `resolveToolResults()` sudah support format OpenAI (`function.name`/`function.arguments`)
- `ChatDataToolService::definitions()` → 9 tools dalam format OpenAI function-calling
- Frontend model selection sudah bisa gonta-ganti via halaman pengaturan (settings)
