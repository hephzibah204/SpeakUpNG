import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, LanguageModel } from 'ai';

// Initialize OpenRouter as an OpenAI-compatible provider
const openrouterProvider = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

/**
 * Returns the best available model based on configured environment variables.
 * Primary: Google Gemini (via GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY)
 * Fallback: OpenRouter
 */
export function getAIModel(preferredModel?: string): LanguageModel {
  const hasGeminiKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);

  if (hasGeminiKey) {
    // Default to Gemini 1.5 Flash for fast/affordable responses
    return google(preferredModel || 'gemini-1.5-flash');
  }

  // Fallback to OpenRouter
  const fallbackModel = preferredModel || process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
  return openrouterProvider(fallbackModel);
}

interface GenerateTextOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

/**
 * Helper to generate text with automatic fallback from Gemini to OpenRouter.
 */
export async function generateContent({
  prompt,
  systemInstruction,
  temperature = 0.7,
  maxTokens = 2000,
  model,
}: GenerateTextOptions) {
  try {
    const aiModel = getAIModel(model);
    const response = await generateText({
      model: aiModel,
      prompt,
      system: systemInstruction,
      temperature,
      maxOutputTokens: maxTokens,
    });
    return response.text;
  } catch (error) {
    console.warn('Primary AI model failed, attempting fallback to OpenRouter...', error);

    // If Gemini failed or wasn't configured, force OpenRouter fallback
    const fallbackModel = openrouterProvider(model || process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini');
    const response = await generateText({
      model: fallbackModel,
      prompt,
      system: systemInstruction,
      temperature,
      maxOutputTokens: maxTokens,
    });
    return response.text;
  }
}
