import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/services/GeminiService';

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required and must be a string' }, { status: 400 });
    }

    const geminiService = new GeminiService();

    const response = await geminiService.completion({
      messages: [
        {
          role: 'system',
          content:
            "You are a helpful AI assistant. Answer questions about people in a friendly and informative way. If you don't know the specific person, politely say so and maybe provide some general information that might be helpful.",
        },
        {
          role: 'user',
          content: question,
        },
      ],
      temperature: 0.7,
      maxTokens: 500,
    });

    const answer = response.choices?.[0]?.message?.content;

    if (!answer) {
      throw new Error('No response generated from AI');
    }

    return NextResponse.json({ answer }, { status: 200 });
  } catch (error) {
    console.error('Error in AI ask API:', error);

    return NextResponse.json(
      {
        error: 'Failed to get AI response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
