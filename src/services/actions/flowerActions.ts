'use server';

import { createClient } from '../supabase/server';
import {
  FlowerRecognitionService,
  type FlowerAnalysisResult,
  type FlowerAnalysisError,
} from '../FlowerRecognitionService';
import { revalidatePath } from 'next/cache';

export interface FlowerUploadResult {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
    image_url: string;
    confidence_score: number;
  };
}

export interface FlowerRecord {
  id: string;
  image_url: string;
  name: string;
  description: string;
  recommendations: string;
  health_status: string;
  confidence_score: number;
  health_notes: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export async function uploadFlowerImage(file: File, userId: string): Promise<FlowerUploadResult> {
  try {
    if (!FlowerRecognitionService.isValidImageFile(file)) {
      return {
        success: false,
        message: 'Invalid file type or size. Please upload a JPEG, PNG, GIF, or WebP image under 10MB.',
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    let analysis: FlowerAnalysisResult | FlowerAnalysisError = {
      isFlower: false,
      error: 'Initialization',
    };

    try {
      const flowerService = new FlowerRecognitionService();
      console.log('Analyzing image for flower recognition...');
      analysis = await flowerService.analyzeFlowerImage(base64Image);
    } catch (error) {
      analysis.isFlower = false;
      console.log('Using mock analysis result as fallback');
    }

    // Check if it's a valid flower/plant image
    if (!analysis.isFlower) {
      return {
        success: false,
        message:
          (analysis as FlowerAnalysisError).error ||
          'This image does not contain flowers or plants. Please upload an image of a flower or plant.',
      };
    }

    const flowerAnalysis = analysis as FlowerAnalysisResult;

    // Upload to Supabase storage
    const supabase = await createClient();

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage.from('flowers').upload(filePath, file);

    if (uploadError) {
      return {
        success: false,
        message: `Upload failed: ${uploadError.message}`,
      };
    }

    const { data: urlData } = supabase.storage.from('flowers').getPublicUrl(filePath);

    const { data: dbData, error: dbError } = await supabase
      .from('flowers')
      .insert({
        user_id: userId,
        image_url: urlData.publicUrl,
        name: flowerAnalysis.name,
        description: flowerAnalysis.description,
        recommendations: flowerAnalysis.recommendations,
        health_status: flowerAnalysis.healthStatus,
        confidence_score: flowerAnalysis.confidenceScore,
        health_notes: flowerAnalysis.healthNotes || null,
      })
      .select()
      .single();

    if (dbError) {
      // If database insert fails, clean up the uploaded file
      await supabase.storage.from('flowers').remove([filePath]);
      return {
        success: false,
        message: `Database error: ${dbError.message}`,
      };
    }

    revalidatePath('/dashboard');
    revalidatePath('/upload');

    return {
      success: true,
      message: `Successfully identified and uploaded: ${flowerAnalysis.name}`,
      data: {
        id: dbData.id,
        name: flowerAnalysis.name,
        image_url: urlData.publicUrl,
        confidence_score: flowerAnalysis.confidenceScore,
      },
    };
  } catch (error) {
    console.error('Error in flower upload:', error);
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function getUserFlowers(userId: string): Promise<FlowerRecord[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('flowers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching flowers:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error loading flowers:', error);
    return [];
  }
}

export async function getFlowerById(flowerId: string, userId: string): Promise<FlowerRecord | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('flowers')
      .select('*')
      .eq('id', flowerId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching flower:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error loading flower:', error);
    return null;
  }
}

export async function deleteFlower(flowerId: string, userId: string): Promise<FlowerUploadResult> {
  try {
    const supabase = await createClient();

    // Verify user owns the flower
    const { data: flowerData, error: checkError } = await supabase
      .from('flowers')
      .select('user_id, image_url')
      .eq('id', flowerId)
      .single();

    if (checkError || !flowerData || flowerData.user_id !== userId) {
      return {
        success: false,
        message: 'Unauthorized or flower not found',
      };
    }

    // Extract file path from image URL
    const url = new URL(flowerData.image_url);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(-2).join('/'); // Get "userId/filename"

    // Delete from storage
    const { error: storageError } = await supabase.storage.from('flowers').remove([filePath]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: dbError } = await supabase.from('flowers').delete().eq('id', flowerId);

    if (dbError) {
      return {
        success: false,
        message: `Database deletion failed: ${dbError.message}`,
      };
    }

    revalidatePath('/dashboard');
    revalidatePath('/upload');

    return {
      success: true,
      message: 'Flower deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting flower:', error);
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function updateFlowerData(
  flowerId: string,
  userId: string,
  updates: {
    name?: string;
    description?: string;
    recommendations?: string;
  },
): Promise<FlowerUploadResult> {
  try {
    const supabase = await createClient();

    // Verify user owns the flower
    const { data: flowerData, error: checkError } = await supabase
      .from('flowers')
      .select('user_id')
      .eq('id', flowerId)
      .single();

    if (checkError || !flowerData || flowerData.user_id !== userId) {
      return {
        success: false,
        message: 'Unauthorized or flower not found',
      };
    }

    // Update the flower data
    const { error: updateError } = await supabase.from('flowers').update(updates).eq('id', flowerId);

    if (updateError) {
      return {
        success: false,
        message: `Update failed: ${updateError.message}`,
      };
    }

    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Flower information updated successfully',
    };
  } catch (error) {
    console.error('Error updating flower:', error);
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function getUserFlowersLimited(userId: string, limit: number = 2): Promise<FlowerRecord[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('flowers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching limited flowers:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error loading limited flowers:', error);
    return [];
  }
}

export async function getRandomFlower(userId: string): Promise<FlowerRecord | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('flowers')
      .select('*')
      .eq('user_id', userId)
      .order('random()')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching random flower:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error loading random flower:', error);
    return null;
  }
}
