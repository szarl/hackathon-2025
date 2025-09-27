'use server';

import { createClient } from '@/services/supabase/server';
import { revalidatePath } from 'next/cache';

export interface ChatMessage {
  id: string;
  flower_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  audio_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateChatMessageParams {
  flower_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  audio_url?: string;
}

export async function createChatMessage(params: CreateChatMessageParams): Promise<ChatMessage | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.from('chat_messages').insert([params]).select().single();

    if (error) {
      console.error('Error creating chat message:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating chat message:', error);
    return null;
  }
}

export async function getChatHistory(flower_id: string, user_id: string): Promise<ChatMessage[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('flower_id', flower_id)
      .eq('user_id', user_id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}

export async function deleteChatHistory(flower_id: string, user_id: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('chat_messages').delete().eq('flower_id', flower_id).eq('user_id', user_id);

    if (error) {
      console.error('Error deleting chat history:', error);
      return false;
    }

    revalidatePath(`/${user_id}/flowers/${flower_id}/chat`);
    return true;
  } catch (error) {
    console.error('Error deleting chat history:', error);
    return false;
  }
}
