import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export interface FlowerAnalysisResult {
  isFlower: boolean;
  name: string;
  description: string;
  recommendations: string;
  healthStatus: 'healthy' | 'diseased' | 'needs_attention' | 'unknown';
  confidenceScore: number;
  healthNotes?: string;
  error?: string;
}

export interface FlowerAnalysisError {
  error: string;
  isFlower: false;
}

export class FlowerRecognitionService {
  private model: GenerativeModel;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is required');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async analyzeFlowerImage(imageBase64: string): Promise<FlowerAnalysisResult | FlowerAnalysisError> {
    try {
      const prompt = `You are a specialized botanist and plant pathologist AI with expertise in flower and plant identification. Your task is to analyze images and determine if they contain flowers or plants.

CRITICAL REQUIREMENTS:
1. ONLY analyze images that clearly show flowers, plants, or botanical specimens
2. If the image does NOT contain flowers or plants, immediately respond with isFlower: false
3. Provide detailed botanical analysis including health assessment
4. Identify any diseases, pests, or health issues
5. Provide specific care recommendations

Response format (JSON only):
{
  "isFlower": boolean,
  "name": "Common and scientific name if identifiable",
  "description": "Detailed botanical description including color, size, characteristics",
  "recommendations": "Specific care instructions including watering, light, soil, fertilization",
  "healthStatus": "healthy" | "diseased" | "needs_attention" | "unknown",
  "confidenceScore": 0.95,
  "healthNotes": "Any observed health issues, diseases, or recommendations"
}

If NOT a flower/plant, respond with:
{
  "isFlower": false,
  "error": "Image does not contain flowers or plants"
}

Please analyze this image:`;

      // Convert base64 to the format Gemini expects
      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg',
        },
      };

      const result = await this.model.generateContent(
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }, imagePart],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json',
          },
        },
        { customHeaders: { 'X-Client-Info': 'flower-recognition-service' } },
      );

      const response = await result.response;
      const text = response.text();

      let analysis: FlowerAnalysisResult;
      try {
        analysis = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse AI response:', text);
        return {
          error: 'Failed to parse AI response',
          isFlower: false,
        };
      }

      // Validate that it's actually a flower/plant
      if (!analysis.isFlower) {
        return {
          error: analysis.error || 'Image does not contain flowers or plants',
          isFlower: false,
        };
      }

      // Ensure confidence score is valid
      const confidenceScore = Math.max(0, Math.min(1, analysis.confidenceScore || 0.5));

      return {
        isFlower: true,
        name: analysis.name || 'Unknown flower/plant',
        description: analysis.description || 'No description available',
        recommendations: analysis.recommendations || 'General plant care recommended',
        healthStatus: analysis.healthStatus || 'unknown',
        confidenceScore,
        healthNotes: analysis.healthNotes || undefined,
      };
    } catch (error) {
      console.error('Error in flower recognition:', error);
      return {
        error: 'Failed to analyze image. Please try again.',
        isFlower: false,
      };
    }
  }

  async analyzeMultipleImages(imagesBase64: string[]): Promise<(FlowerAnalysisResult | FlowerAnalysisError)[]> {
    const results = await Promise.all(
      imagesBase64.map(async (imageBase64) => {
        return this.analyzeFlowerImage(imageBase64);
      }),
    );

    return results;
  }

  // Server-side method to convert File to base64
  static async fileToBase64(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
  }

  // Helper method to validate image file
  static isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return false;
    }

    if (file.size > maxSize) {
      return false;
    }

    return true;
  }
}
