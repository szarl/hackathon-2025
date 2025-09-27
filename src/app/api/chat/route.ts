import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/services/supabase/server';
import { GeminiService } from '@/services/GeminiService';
import { createChatMessage, getChatHistory } from '@/services/actions/chatActions';
import { getFlowerById } from '@/services/actions/flowerActions';

export async function POST(request: NextRequest) {
  try {
    const { message, flower_id, user_id, audio_url } = await request.json();

    if (!message || !flower_id || !user_id) {
      return NextResponse.json({ error: 'Missing required fields: message, flower_id, user_id' }, { status: 400 });
    }

    // Verify user authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || user.id !== user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get flower information
    const flower = await getFlowerById(flower_id, user_id);
    if (!flower) {
      return NextResponse.json({ error: 'Flower not found' }, { status: 404 });
    }

    // Save user message to database
    const userMessage = await createChatMessage({
      flower_id,
      user_id,
      role: 'user',
      content: message,
      audio_url,
    });

    if (!userMessage) {
      return NextResponse.json({ error: 'Failed to save user message' }, { status: 500 });
    }

    // Get chat history for context
    const chatHistory = await getChatHistory(flower_id, user_id);

    // Prepare messages for Gemini
    const messages = [
      {
        role: 'system' as const,
        content: `You are Plantastic, an AI assistant specialized in plant care. You are helping the user with their ${flower.name} plant. 

Plant Information:
- Name: ${flower.name}
- Description: ${flower.description || 'No description available'}
- Health Status: ${flower.health_status || 'Unknown'}
- Health Notes: ${flower.health_notes || 'No health notes available'}

Provide helpful, accurate, and personalized advice about plant care, health issues, watering schedules, fertilizing, and general plant maintenance. Be friendly, encouraging, and educational. If you don't know something specific about this plant, say so and provide general plant care advice.`,
      },
      ...chatHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: message,
      },
    ];

    // Get response from Gemini
    const geminiService = new GeminiService();
    const response = await geminiService.completion({
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    });

    const assistantMessage = response.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      return NextResponse.json({ error: 'Failed to get response from AI' }, { status: 500 });
    }

    // Save assistant message to database
    const savedAssistantMessage = await createChatMessage({
      flower_id,
      user_id,
      role: 'assistant',
      content: assistantMessage,
    });

    if (!savedAssistantMessage) {
      return NextResponse.json({ error: 'Failed to save assistant message' }, { status: 500 });
    }

    return NextResponse.json({
      message: assistantMessage,
      userMessage,
      assistantMessage: savedAssistantMessage,
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
