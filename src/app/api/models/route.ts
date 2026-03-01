import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { provider, apiKey, baseUrl } = body;

        let models: string[] = [];

        if (provider === 'gemini') {
            if (!apiKey) throw new Error("API Key required");
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            if (!res.ok) throw new Error("Failed to fetch Google models");
            const data = await res.json();
            // Filter only models that support generateContent (like gemini series)
            models = data.models
                .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
                .map((m: any) => m.name.replace('models/', ''));
        }
        else if (provider === 'openai') {
            const endpoint = baseUrl || 'https://api.openai.com/v1';
            console.log("Fetching OpenAI models from:", endpoint);
            if (!apiKey && !baseUrl) throw new Error("API Key or Base URL required");

            try {
                const res = await fetch(`${endpoint.replace(/\/$/, '')}/models`, {
                    headers: { 'Authorization': `Bearer ${apiKey || 'dummy'}` }
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                console.log("OpenAI models raw response:", JSON.stringify(data).slice(0, 200));
                // Try to filter for text/chat models
                models = data.data
                    .map((m: any) => m.id)
                    // Filter out embeddings/audio/whisper if standard openai, but if it's a proxy they might not have these prefixes.
                    .filter((id: string) => !id.includes('embedding') && !id.includes('whisper') && !id.includes('tts') && !id.includes('dall-e'))
                    .sort();
                console.log("Filtered OpenAI models:", models);
            } catch (err: any) {
                console.warn(`OpenAI /models fetch failed for ${endpoint}:`, err.message);
                models = [];
            }
        }
        else if (provider === 'vllm') {
            if (!baseUrl) throw new Error("Base URL required");
            console.log("Fetching vLLM models from:", baseUrl);
            // vLLM matches the OpenAI API spec for listing models
            try {
                const res = await fetch(`${baseUrl.replace(/\/$/, '')}/models`, {
                    headers: { 'Authorization': `Bearer ${apiKey || 'dummy'}` }
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                console.log("vLLM models raw response:", JSON.stringify(data).slice(0, 200));
                models = data.data.map((m: any) => m.id);
                console.log("Filtered vLLM models:", models);
            } catch (err: any) {
                console.warn(`vLLM /models fetch failed for ${baseUrl}:`, err.message);
                models = [];
            }
        }

        return NextResponse.json({ models });
    } catch (error: any) {
        console.error("Models fetch error:", error);
        return NextResponse.json({ error: error.message || 'Failed to fetch models', models: [] }, { status: 500 });
    }
}
