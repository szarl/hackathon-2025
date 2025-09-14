import { QdrantClient } from '@qdrant/js-client-rest';
import { v4 as uuidv4 } from 'uuid';
import { GeminiService } from './GeminiService';

export class VectorService {
  private client: QdrantClient;
  private geminiService: GeminiService;

  constructor(geminiService: GeminiService) {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.geminiService = geminiService;
  }

  async ensureCollection(name: string): Promise<void> {
    try {
      // First, get expected dimensions from GeminiService
      const testEmbedding = await this.geminiService.createEmbedding('test');
      const expectedDimensions = testEmbedding.length;
      console.log(`Expected vector dimensions: ${expectedDimensions}`);

      // Check if collection exists
      const collections = await this.client.getCollections();
      const existingCollection = collections.collections.find((c) => c.name === name);

      if (!existingCollection) {
        console.log(`Creating collection '${name}' with ${expectedDimensions} dimensions...`);
        await this.client.createCollection(name, {
          vectors: { size: expectedDimensions, distance: 'Cosine' },
        });
        console.log(`✅ Collection '${name}' created successfully`);
        console.log(`✅ Collection '${name}' is ready`);
        return;
      }

      console.log(`✅ Collection '${name}' already exists`);

      // Check if dimensions match
      try {
        const collectionInfo = await this.client.getCollection(name);
        const vectorSize = collectionInfo.config?.params?.vectors?.size;

        if (vectorSize && vectorSize !== expectedDimensions) {
          console.warn(`⚠️ Collection '${name}' has ${vectorSize} dimensions, expected ${expectedDimensions}.`);
          console.log(`🔄 Recreating collection with correct dimensions...`);

          // Delete the existing collection
          await this.client.deleteCollection(name);
          console.log(`🗑️ Deleted existing collection '${name}'`);

          // Create new collection with correct dimensions
          await this.client.createCollection(name, {
            vectors: { size: expectedDimensions, distance: 'Cosine' },
          });
          console.log(`✅ Collection '${name}' recreated with ${expectedDimensions} dimensions`);
        } else {
          console.log(`✅ Collection '${name}' has correct dimensions (${vectorSize})`);
        }
      } catch (infoError) {
        console.warn('Could not retrieve collection info:', infoError);
        // If we can't get info, assume it might be wrong and recreate
        console.log(`🔄 Recreating collection to ensure correct dimensions...`);

        await this.client.deleteCollection(name);
        await this.client.createCollection(name, {
          vectors: { size: expectedDimensions, distance: 'Cosine' },
        });
        console.log(`✅ Collection '${name}' recreated with ${expectedDimensions} dimensions`);
      }

      console.log(`✅ Collection '${name}' is ready`);
    } catch (error) {
      console.error('Error ensuring collection:', error);
      throw error;
    }
  }

  async addPoints(collectionName: string, points: { id: string; text: string; role: string }[]) {
    try {
      console.log(`Processing ${points.length} points for embedding...`);

      const pointsToUpsert = [];

      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        if (!point) continue;

        console.log(`Generating embedding for point ${i + 1}/${points.length}: ${point.id}`);

        try {
          const embedding = await this.geminiService.createEmbedding(point.text);

          // Validate embedding
          if (!Array.isArray(embedding) || embedding.length === 0) {
            console.error(`Invalid embedding for point ${point.id}:`, embedding);
            continue;
          }

          console.log(`✅ Embedding generated for ${point.id} (${embedding.length} dimensions)`);

          pointsToUpsert.push({
            id: uuidv4(),
            vector: embedding,
            payload: {
              original_id: point.id, // Store the original ID in payload for reference
              text: point.text,
              role: point.role,
              title: point.id.includes('_problem')
                ? 'Problem'
                : point.id.includes('_solution')
                  ? 'Solution'
                  : 'Support Request',
              created_at: new Date().toISOString(),
            },
          });
        } catch (embeddingError) {
          console.error(`Failed to generate embedding for point ${point.id}:`, embeddingError);
          continue;
        }
      }

      if (pointsToUpsert.length === 0) {
        console.log('⚠️ No valid points to upsert');
        return;
      }

      console.log(`Upserting ${pointsToUpsert.length} points to Qdrant...`);

      // Log a sample point to debug the format
      if (pointsToUpsert.length > 0) {
        console.log('Sample point structure:', JSON.stringify(pointsToUpsert[0], null, 2));
      }

      await this.client.upsert(collectionName, {
        wait: true,
        points: pointsToUpsert,
      });

      console.log(`✅ Successfully upserted ${pointsToUpsert.length} points`);
    } catch (error: any) {
      console.error('Error adding points to Qdrant:', error);

      // Try to get more detailed error information
      if (error.data && error.data.status) {
        console.error('Qdrant error details:', JSON.stringify(error.data.status, null, 2));
      }

      throw error;
    }
  }

  async performSearch(collectionName: string, query: string, limit: number = 5) {
    const queryEmbedding = await this.geminiService.createEmbedding(query);
    return this.client.search(collectionName, {
      vector: queryEmbedding,
      limit,
      with_payload: true,
    });
  }
}
