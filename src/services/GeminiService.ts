import { GoogleGenerativeAI, GenerativeModel, ChatSession } from '@google/generative-ai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { ParsingError } from './AssistantService';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private embeddingModel: GenerativeModel;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    // New model is gemini-embedding-001 but it is more expensive
    // text-embedding-004 is cheap but only 768 dimensions
    this.embeddingModel = this.genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  }

  async completion(config: {
    messages: ChatCompletionMessageParam[];
    model?: string;
    temperature?: number;
    jsonMode?: boolean;
    maxTokens?: number;
  }): Promise<any> {
    const { messages, temperature = 0, jsonMode = false, maxTokens = 4096 } = config;

    try {
      // Convert OpenAI format messages to Gemini format
      const geminiMessages = this.convertMessagesToGemini(messages);

      const generationConfig = {
        temperature,
        maxOutputTokens: maxTokens,
        ...(jsonMode && { responseMimeType: 'application/json' }),
      };

      // Start a chat session
      const chat = this.model.startChat({
        generationConfig,
        history: geminiMessages.slice(0, -1).map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.parts }],
        })),
      });

      // Send the last message
      const lastMessage = geminiMessages[geminiMessages.length - 1];
      if (!lastMessage) {
        throw new Error('No messages to send');
      }
      const result = await chat.sendMessage(lastMessage.parts);
      const response = await result.response;

      // Convert to OpenAI-compatible format
      return {
        choices: [
          {
            message: {
              content: response.text(),
              role: 'assistant',
            },
          },
        ],
        usage: {
          total_tokens: response.usageMetadata?.totalTokenCount || 0,
          prompt_tokens: response.usageMetadata?.promptTokenCount || 0,
          completion_tokens: response.usageMetadata?.candidatesTokenCount || 0,
        },
      };
    } catch (error) {
      console.error('Error in Gemini completion:', error);
      throw error;
    }
  }

  private convertMessagesToGemini(messages: ChatCompletionMessageParam[]): GeminiMessage[] {
    const geminiMessages: GeminiMessage[] = [];

    for (const message of messages) {
      if (message.role === 'system') {
        // Gemini doesn't have a system role, so we'll prepend system message to the first user message
        const systemContent = message.content as string;
        const nextUserIndex = messages.findIndex((m, i) => i > messages.indexOf(message) && m.role === 'user');

        if (nextUserIndex !== -1) {
          const userMessage = messages[nextUserIndex];
          if (userMessage) {
            const combinedContent = `System: ${systemContent}\n\nUser: ${userMessage.content}`;
            // We'll handle this when we encounter the user message
            continue;
          }
        }

        // If no user message follows, convert system to user
        geminiMessages.push({
          role: 'user',
          parts: systemContent,
        });
      } else if (message.role === 'user') {
        // Check if there was a system message before this
        const prevSystemIndex = messages.findIndex((m, i) => i < messages.indexOf(message) && m.role === 'system');
        const prevSystemMessage = prevSystemIndex !== -1 ? messages[prevSystemIndex] : null;

        let content = message.content as string;
        if (prevSystemMessage && !geminiMessages.some((m) => m.parts.includes(prevSystemMessage.content as string))) {
          content = `System: ${prevSystemMessage.content}\n\nUser: ${content}`;
        }

        geminiMessages.push({
          role: 'user',
          parts: content,
        });
      } else if (message.role === 'assistant') {
        geminiMessages.push({
          role: 'model',
          parts: message.content as string,
        });
      }
    }

    return geminiMessages;
  }

  parseJsonResponse<IResponseFormat>(response: any): IResponseFormat | ParsingError {
    try {
      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Invalid response structure');
      }
      const parsedContent = JSON.parse(content);
      return parsedContent;
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return { error: 'Failed to process response', result: false };
    }
  }

  async createEmbedding(text: string): Promise<number[]> {
    try {
      // Validate input
      if (!text || typeof text !== 'string') {
        throw new Error('Invalid text input for embedding');
      }

      // Trim and limit text length (Gemini has token limits)
      const cleanText = text.trim();
      if (cleanText.length === 0) {
        throw new Error('Empty text provided for embedding');
      }

      // Limit text length to avoid token limits (roughly 1 million characters should be safe)
      const limitedText = cleanText.length > 100000 ? cleanText.substring(0, 100000) + '...' : cleanText;

      console.log(`Creating embedding for text (${limitedText.length} characters)...`);

      const result = await this.embeddingModel.embedContent(limitedText);
      const embedding = result.embedding;

      if (!embedding || !embedding.values || !Array.isArray(embedding.values)) {
        throw new Error('Invalid embedding response from Gemini');
      }

      console.log(`✅ Embedding created successfully (${embedding.values.length} dimensions)`);
      return embedding.values;
    } catch (error) {
      console.error('Error creating embedding:', error);
      console.error('Text that failed:', text?.substring(0, 200) + '...');
      throw error;
    }
  }

  async countTokens(messages: ChatCompletionMessageParam[], model: string = 'gemini-1.5-flash'): Promise<number> {
    try {
      // Convert messages to a single text string for token counting
      const text = messages.map((m) => `${m.role}: ${m.content}`).join('\n');

      const result = await this.model.countTokens(text);
      return result.totalTokens;
    } catch (error) {
      console.error('Error counting tokens:', error);
      return 0; // Return 0 if token counting fails
    }
  }

  // Compatibility method for streaming (Gemini has different streaming API)
  isStreamResponse(response: any): boolean {
    return false; // For now, we'll disable streaming for Gemini
  }
}
