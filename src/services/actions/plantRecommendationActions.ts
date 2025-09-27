'use server';

import { GeminiService } from '../GeminiService';
import { getCurrentUserId } from './supabaseActions';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export interface PlantRecommendation {
  name: string;
  latinName: string;
  keyReason: string;
  careTip: string;
  image: string;
}

export interface PlantPreferences {
  lightConditions: string;
  spaceSize: string;
  experienceLevel: string;
  humidityLevel: string;
  temperature: string;
}

export async function getCurrentUserForRedirect(): Promise<string | null> {
  try {
    return await getCurrentUserId();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function generatePlantRecommendations(preferences: PlantPreferences): Promise<PlantRecommendation[]> {
  const geminiService = new GeminiService();

  // Create the appropriate prompt based on experience level
  let prompt = '';

  switch (preferences.experienceLevel.toLowerCase()) {
    case 'beginner':
      prompt = `Please generate three houseplant suggestions based on the following user context and conditions. The suggestions must be easy to care for (beginner level) and thrive in the specific environment provided.

User Context (Persona: Beginner Level, low maintenance tolerance):
Skill Level: Absolute beginner (struggles to keep plants alive).
Maintenance Need: Requires very simple and forgiving plants.
Light Conditions: ${preferences.lightConditions.toLowerCase()}-light conditions.
Temperature: ${preferences.temperature.toLowerCase()} temperature.
Space Size: ${preferences.spaceSize.toLowerCase()} space.
Humidity: ${preferences.humidityLevel.toLowerCase()} humidity.

For each plant suggestion, provide:
Plant Name (English & Latin).
Key Reason for Selection (Why is it good for a beginner with these conditions?).
Core Care Tip (The single most important rule).

Example Output Structure (The generator should follow this format):
Sansevieria trifasciata (Snake Plant):
Key Reason: Extremely resilient; tolerates neglect and bright, direct light. Very difficult to overwater.
Core Care Tip: Water only when the soil is completely dry (usually every 3-4 weeks)`;
      break;

    case 'some':
      prompt = `Please generate three engaging houseplant suggestions based on the following user context and conditions. The suggestions must be suitable for an Intermediate-level gardener who is ready to move beyond basic survival and focus on consistent care and specific environmental adjustments.

User Context (Persona: Intermediate Level):
Skill Level: Intermediate (Has mastered basic watering consistency but needs to learn specific environmental controls, like pruning or managing humidity).
Maintenance Need: Requires consistent, non-daily attention; sensitive to specific care areas (e.g., fertilization, humidity, or precise light).
Light Conditions: ${preferences.lightConditions.toLowerCase()}-light conditions.
Temperature: ${preferences.temperature.toLowerCase()} temperature.
Space Size: ${preferences.spaceSize.toLowerCase()} space.
Humidity: ${preferences.humidityLevel.toLowerCase()} humidity.

For each plant suggestion, provide:
Plant Name (English & Latin).
Key Reason for Selection (Why is it a good next step for an intermediate gardener with these conditions?).
The Intermediate Focus (The specific care aspect they need to master).

Example Output Structure (The generator should follow this format):
Bird of Paradise (Strelitzia nicolai):
Key Reason: Loves the intense, bright light from a south window and offers a spectacular tropical aesthetic. It's a great "statement" plant.
The Intermediate Focus: Mastering the balance of heavy watering during active growth versus reduced watering in winter, and learning to manage humidity to prevent browning leaf edges.`;
      break;

    case 'expert':
      prompt = `Please generate three demanding houseplant suggestions based on the following user context and conditions. The suggestions must be suitable for an expert-level gardener who can manage specific, high-maintenance needs and who has optimal conditions.

User Context (Persona: Expert Level):
Skill Level: Expert (Mastery of precise watering, humidity, and nutrient control).
Maintenance Need: Requires specific, high-maintenance care (e.g., specific fertilization, pruning, or humidity needs).
Light Conditions: ${preferences.lightConditions.toLowerCase()}-light conditions.
Temperature: ${preferences.temperature.toLowerCase()} temperature.
Space Size: ${preferences.spaceSize.toLowerCase()} space.
Humidity: ${preferences.humidityLevel.toLowerCase()} humidity.

For each plant suggestion, provide:
Plant Name (English & Latin).
Key Reason for Selection (Why is it a good choice for an expert with these conditions?).
The Expert's Challenge (The specific, difficult care requirement).

Example Output Structure (The generator should follow this format):
Fiddle Leaf Fig (Ficus lyrata):
Key Reason: Thrives in intense bright light; rewarding vertical growth for dramatic interior design. Requires precise watering balance.
The Expert's Challenge: Highly sensitive to moving and prone to "Fiddle Leaf Fig disease" (brown spotting) if watering is inconsistent or if humidity suddenly drops. Requires frequent dusting/cleaning of large leaves.`;
      break;

    default:
      throw new Error('Invalid experience level');
  }

  prompt += `

Please provide exactly 3 plant recommendations in the following JSON format as an array:
[
  {
    "name": "Plant Name",
    "latinName": "Latin Name", 
    "keyReason": "Short reason for selection based on user conditions",
    "careTip": "Main care instruction or tip"
  }
]

Make sure to return valid JSON only, no additional text or markdown formatting.`;

  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'user',
      content: prompt,
    },
  ];

  try {
    const response = await geminiService.completion({
      messages,
      temperature: 0.7,
      maxTokens: 5000,
    });

    const content = response.choices?.[0]?.message?.content ?? response[0].message.content;
    console.log('AI Response Content:', response);
    if (!content) {
      throw new Error('No content received from AI service');
    }

    // Parse the response to extract plant recommendations
    const recommendations = parsePlantRecommendations(content);

    // Add appropriate images based on the plants
    return recommendations.map((rec, index) => ({
      ...rec,
      image: getPlantImage(rec.name, index),
    }));
  } catch (error) {
    console.error('Error generating plant recommendations:', error);
    throw new Error('Failed to generate plant recommendations');
  }
}

function parsePlantRecommendations(content: string): Omit<PlantRecommendation, 'image'>[] {
  try {
    // First, try to parse as JSON directly
    let cleanContent = content.trim();

    // Remove markdown code blocks if present
    cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // Try to find JSON array in the content
    const jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanContent = jsonMatch[0];
    }

    const parsedRecommendations = JSON.parse(cleanContent);

    if (Array.isArray(parsedRecommendations) && parsedRecommendations.length > 0) {
      return parsedRecommendations
        .map((rec: any) => ({
          name: rec.name || '',
          latinName: rec.latinName || '',
          keyReason: rec.keyReason || '',
          careTip: rec.careTip || rec.keyReason || '',
        }))
        .slice(0, 3);
    }
  } catch (error) {
    console.log('JSON parsing failed, trying text parsing...', error);
  }

  // Fallback to text parsing if JSON parsing fails
  const recommendations: Omit<PlantRecommendation, 'image'>[] = [];

  // Split by plant entries (look for patterns like "Plant Name (Latin Name):")
  const plantEntries = content.split(/(?=\w+.*\([^)]+\):)/);

  for (const entry of plantEntries) {
    if (entry.trim().length === 0) continue;

    const lines = entry
      .trim()
      .split('\n')
      .filter((line) => line.trim().length > 0);
    if (lines.length < 3) continue;

    // Extract plant name and latin name from first line
    const nameMatch = lines[0].match(/^([^(]+)\s*\(([^)]+)\):/);
    if (!nameMatch) continue;

    const name = nameMatch[1].trim();
    const latinName = nameMatch[2].trim();

    // Extract key reason
    const keyReasonLine = lines.find(
      (line) =>
        line.toLowerCase().includes('key reason') ||
        line.toLowerCase().includes('intermediate focus') ||
        line.toLowerCase().includes("expert's challenge"),
    );
    const keyReason = keyReasonLine
      ? keyReasonLine.replace(/^(Key Reason|The Intermediate Focus|The Expert's Challenge):\s*/i, '').trim()
      : '';

    // Extract care tip
    const careTipLine = lines.find(
      (line) =>
        line.toLowerCase().includes('core care tip') ||
        line.toLowerCase().includes('intermediate focus') ||
        line.toLowerCase().includes("expert's challenge"),
    );
    const careTip = careTipLine
      ? careTipLine.replace(/^(Core Care Tip|The Intermediate Focus|The Expert's Challenge):\s*/i, '').trim()
      : '';

    if (name && latinName && keyReason) {
      recommendations.push({
        name,
        latinName,
        keyReason,
        careTip: careTip || keyReason,
      });
    }
  }

  // If parsing failed, return some default recommendations
  if (recommendations.length === 0) {
    return [
      {
        name: 'Snake Plant',
        latinName: 'Sansevieria trifasciata',
        keyReason: 'Extremely resilient and tolerates neglect. Perfect for beginners.',
        careTip: 'Water only when soil is completely dry (every 3-4 weeks)',
      },
      {
        name: 'Pothos',
        latinName: 'Epipremnum aureum',
        keyReason: 'Very forgiving and grows well in various light conditions.',
        careTip: 'Water when top inch of soil is dry',
      },
      {
        name: 'ZZ Plant',
        latinName: 'Zamioculcas zamiifolia',
        keyReason: 'Thrives on neglect and is very drought tolerant.',
        careTip: 'Water sparingly, only when soil is completely dry',
      },
    ];
  }

  return recommendations.slice(0, 3);
}

function getPlantImage(plantName: string, index: number): string {
  // Map plant names to available images
  const plantImageMap: { [key: string]: string } = {
    'snake plant': '/firstPlant.jpg',
    sansevieria: '/firstPlant.jpg',
    pothos: '/secondPlant.jpg',
    epipremnum: '/secondPlant.jpg',
    'zz plant': '/thridPlant.jpg',
    zamioculcas: '/thridPlant.jpg',
    monstera: '/firstPlant.jpg',
    'fiddle leaf fig': '/secondPlant.jpg',
    ficus: '/secondPlant.jpg',
    'bird of paradise': '/thridPlant.jpg',
    strelitzia: '/thridPlant.jpg',
  };

  const lowerName = plantName.toLowerCase();
  for (const [key, image] of Object.entries(plantImageMap)) {
    if (lowerName.includes(key)) {
      return image;
    }
  }

  // Default fallback based on index
  const defaultImages = ['/firstPlant.jpg', '/secondPlant.jpg', '/thridPlant.jpg'];

  return defaultImages[index % defaultImages.length];
}
