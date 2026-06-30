import { NextResponse } from 'next/server';
import { getAIModel } from '@/lib/ai';
import { generateText } from 'ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, model, temperature, max_tokens } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Get the configured model (Gemini with OpenRouter fallback)
    const aiModel = getAIModel(model);

    const response = await generateText({
      model: aiModel,
      messages,
      temperature: temperature ?? 0.7,
      maxOutputTokens: max_tokens ?? 2000,
    });

    // Format response to match the OpenRouter / OpenAI chat completions format 
    // that the frontend expects
    return NextResponse.json({
      choices: [
        {
          message: {
            role: 'assistant',
            content: response.text,
          },
        },
      ],
    });
  } catch (error: any) {
    console.error('Vercel AI SDK Chat route error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
