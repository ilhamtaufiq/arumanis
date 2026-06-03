export type ChatProviderId =
    | 'openrouter'
    | 'openai'
    | 'gemini'
    | 'deepseek'
    | 'groq'
    | 'mistral'
    | 'github-models'
    | 'huggingface'
    | 'nebius'
    | 'nscale'
    | 'cerebras'
    | 'xai'
    | 'ai21'
    | 'aionlabs'
    | 'alibaba'
    | 'zai'
    | 'kilo'
    | 'llm7'
    | 'modelscope'
    | 'nvidia'
    | 'siliconflow'
    | 'ovhcloud'
    | 'cloudflare-workers-ai'
    | 'cohere'
    | 'ollama';

export type ChatProviderSelection = ChatProviderId | 'auto';

export interface ChatProviderOption {
    value: ChatProviderId;
    label: string;
    baseUrl: string;
    defaultModel: string;
    apiKeyEnv: string | null;
    supported: boolean;
    notes?: string;
}

export interface ChatProviderSelectionOption extends Omit<ChatProviderOption, 'value'> {
    value: ChatProviderSelection;
}

export const CHAT_PROVIDER_OPTIONS: ChatProviderOption[] = [
    {
        value: 'openrouter',
        label: 'OpenRouter',
        baseUrl: 'https://openrouter.ai/api/v1',
        defaultModel: 'openai/gpt-oss-120b:free',
        apiKeyEnv: 'OPENROUTER_API_KEY',
        supported: true,
    },
    {
        value: 'openai',
        label: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        defaultModel: 'gpt-4o-mini',
        apiKeyEnv: 'OPENAI_API_KEY',
        supported: true,
    },
    {
        value: 'gemini',
        label: 'Google Gemini',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
        defaultModel: 'gemini-2.5-flash-lite',
        apiKeyEnv: 'GEMINI_API_KEY',
        supported: true,
    },
    {
        value: 'deepseek',
        label: 'DeepSeek',
        baseUrl: 'https://api.deepseek.com/v1',
        defaultModel: 'deepseek-chat',
        apiKeyEnv: 'DEEPSEEK_API_KEY',
        supported: true,
    },
    {
        value: 'groq',
        label: 'Groq',
        baseUrl: 'https://api.groq.com/openai/v1',
        defaultModel: 'llama-3.3-70b-versatile',
        apiKeyEnv: 'GROQ_API_KEY',
        supported: true,
    },
    {
        value: 'mistral',
        label: 'Mistral AI',
        baseUrl: 'https://api.mistral.ai/v1',
        defaultModel: 'mistral-small-latest',
        apiKeyEnv: 'MISTRAL_API_KEY',
        supported: true,
    },
    {
        value: 'github-models',
        label: 'GitHub Models',
        baseUrl: 'https://models.github.ai/inference',
        defaultModel: 'openai/gpt-4.1',
        apiKeyEnv: 'GITHUB_TOKEN',
        supported: true,
    },
    {
        value: 'huggingface',
        label: 'Hugging Face',
        baseUrl: 'https://router.huggingface.co/v1',
        defaultModel: 'meta-llama/Meta-Llama-3.1-8B-Instruct:fastest',
        apiKeyEnv: 'HF_TOKEN',
        supported: true,
    },
    {
        value: 'nebius',
        label: 'Nebius',
        baseUrl: 'https://api.studio.nebius.com/v1',
        defaultModel: 'gpt-oss-120b',
        apiKeyEnv: 'NEBIUS_API_KEY',
        supported: true,
    },
    {
        value: 'nscale',
        label: 'Nscale',
        baseUrl: 'https://inference.api.nscale.com/v1',
        defaultModel: 'gpt-oss-120b',
        apiKeyEnv: 'NSCALE_API_KEY',
        supported: true,
    },
    {
        value: 'cerebras',
        label: 'Cerebras',
        baseUrl: 'https://api.cerebras.ai/v1',
        defaultModel: 'gpt-oss-120b',
        apiKeyEnv: 'CEREBRAS_API_KEY',
        supported: true,
    },
    {
        value: 'xai',
        label: 'xAI',
        baseUrl: 'https://api.x.ai/v1',
        defaultModel: 'grok-4.1-fast',
        apiKeyEnv: 'XAI_API_KEY',
        supported: true,
    },
    {
        value: 'ai21',
        label: 'AI21 Labs',
        baseUrl: 'https://api.ai21.com/studio/v1',
        defaultModel: 'jamba-mini-2',
        apiKeyEnv: 'AI21_API_KEY',
        supported: true,
    },
    {
        value: 'aionlabs',
        label: 'Aion Labs',
        baseUrl: 'https://api.aionlabs.ai/v1',
        defaultModel: 'aion-2.0',
        apiKeyEnv: 'AIONLABS_API_KEY',
        supported: true,
    },
    {
        value: 'alibaba',
        label: 'Alibaba Cloud Model Studio',
        baseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
        defaultModel: 'qwen3-plus',
        apiKeyEnv: 'DASHSCOPE_API_KEY',
        supported: true,
    },
    {
        value: 'zai',
        label: 'Z AI',
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        defaultModel: 'glm-4.7-flash',
        apiKeyEnv: 'ZAI_API_KEY',
        supported: true,
    },
    {
        value: 'kilo',
        label: 'Kilo Code',
        baseUrl: 'https://api.kilo.ai/api/gateway',
        defaultModel: 'kilo-auto/free',
        apiKeyEnv: 'KILO_API_KEY',
        supported: true,
    },
    {
        value: 'llm7',
        label: 'LLM7.io',
        baseUrl: 'https://api.llm7.io/v1',
        defaultModel: 'gpt-4o-mini',
        apiKeyEnv: 'LLM7_API_KEY',
        supported: true,
    },
    {
        value: 'modelscope',
        label: 'ModelScope',
        baseUrl: 'https://api-inference.modelscope.cn/v1',
        defaultModel: 'Qwen/Qwen3.5-27B',
        apiKeyEnv: 'MODELSCOPE_API_KEY',
        supported: true,
    },
    {
        value: 'nvidia',
        label: 'NVIDIA NIM',
        baseUrl: 'https://integrate.api.nvidia.com/v1',
        defaultModel: 'deepseek-ai/deepseek-r1',
        apiKeyEnv: 'NVIDIA_API_KEY',
        supported: true,
    },
    {
        value: 'siliconflow',
        label: 'SiliconFlow',
        baseUrl: 'https://api.siliconflow.cn/v1',
        defaultModel: 'Qwen/Qwen3-8B',
        apiKeyEnv: 'SILICONFLOW_API_KEY',
        supported: true,
    },
    {
        value: 'ovhcloud',
        label: 'OVHcloud AI Endpoints',
        baseUrl: 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1',
        defaultModel: 'Meta-Llama-3_3-70B-Instruct',
        apiKeyEnv: null,
        supported: true,
        notes: 'Bisa dipakai tanpa API key pada tier anonim.',
    },
    {
        value: 'cloudflare-workers-ai',
        label: 'Cloudflare Workers AI',
        baseUrl: 'https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/v1',
        defaultModel: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
        apiKeyEnv: 'CLOUDFLARE_API_TOKEN',
        supported: false,
        notes: 'Butuh adapter native, bukan chat completions standar.',
    },
    {
        value: 'cohere',
        label: 'Cohere',
        baseUrl: 'https://api.cohere.com/v2',
        defaultModel: 'command-r-plus',
        apiKeyEnv: 'COHERE_API_KEY',
        supported: false,
        notes: 'Endpoint v2 tidak dipetakan ke bridge chat saat ini.',
    },
    {
        value: 'ollama',
        label: 'Ollama Cloud',
        baseUrl: 'https://api.ollama.com',
        defaultModel: 'gpt-oss:120b-cloud',
        apiKeyEnv: null,
        supported: false,
        notes: 'Repo referensi menandai provider ini non-OpenAI-compatible.',
    },
];

export const DEFAULT_CHAT_PROVIDER: ChatProviderSelection = 'auto';

export const CHAT_PROVIDER_SELECTION_OPTIONS: ChatProviderSelectionOption[] = [
    {
        value: 'auto',
        label: 'Rotasi Otomatis',
        baseUrl: '',
        defaultModel: 'auto',
        apiKeyEnv: null,
        supported: true,
        notes: 'Akan memilih provider yang tersedia secara bergiliran dan fallback otomatis bila gagal.',
    },
    ...CHAT_PROVIDER_OPTIONS,
];

export function getChatApiKeySettingKey(provider: ChatProviderId): string {
    return `chat_api_key_${provider.replace(/-/g, '_')}`;
}

export function getChatProviderOption(provider: string | null | undefined) {
    return CHAT_PROVIDER_OPTIONS.find((option) => option.value === provider) ?? CHAT_PROVIDER_OPTIONS[0];
}
