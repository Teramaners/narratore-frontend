import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "default_key",
});

interface StoryResponse {
  story: string;
}

export async function generateStoryFromDream(dream: string): Promise<StoryResponse> {
  try {
    const message = await anthropic.messages.create({
      max_tokens: 2000,
      model: 'claude-3-7-sonnet-20250219',
      system: "You are 'Narratore di Sogni', an expert literary storyteller. Your task is to transform a user's dream description into a beautiful, professionally written literary short story. Follow these guidelines: 1) Maintain the core elements and imagery of the dream, 2) Add literary structure, characters, and narrative flow, 3) Use vivid descriptions and elegant language, 4) Create a clear beginning, middle and end, 5) Add a creative title at the beginning. The tone should be mystical, evocative and dreamlike. Maximum length should be about 500-600 words.",
      messages: [{ role: 'user', content: dream }],
    });

    return { story: message.content[0].text };
  } catch (error: any) {
    throw new Error(`Claude API error: ${error?.message || 'Unknown error'}`);
  }
}
