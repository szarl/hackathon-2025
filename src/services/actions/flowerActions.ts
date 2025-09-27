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

    // Generate tasks for the new flower
    try {
      const { error: taskError } = await supabase.rpc('generate_flower_tasks', {
        p_flower_id: dbData.id,
        p_user_id: userId,
        p_flower_name: flowerAnalysis.name,
      });

      if (taskError) {
        console.error('Error generating tasks:', taskError);
        // Don't fail the upload if task generation fails
      }
    } catch (error) {
      console.error('Error generating tasks:', error);
      // Don't fail the upload if task generation fails
    }

    revalidatePath('/dashboard');
    revalidatePath('/upload');
    revalidatePath('/calendar');

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

// Task-related interfaces and functions
export interface TaskRecord {
  id: string;
  flower_id: string;
  user_id: string;
  task_type: 'watering' | 'fertilizing' | 'health_check' | 'rotate' | 'repot';
  title: string;
  description: string | null;
  scheduled_date: string;
  scheduled_time: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'scheduled' | 'completed' | 'overdue' | 'cancelled';
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  flower_name?: string;
}

export interface FlowerUpdateRecord {
  id: string;
  flower_id: string;
  user_id: string;
  scan_image_url: string | null;
  ai_analysis: any;
  status: 'pending' | 'completed' | 'failed';
  confidence_score: number | null;
  issue_type: string | null;
  issue_description: string | null;
  recommendations: any;
  created_at: string;
  updated_at: string;
  flowers?: {
    name: string;
    image_url: string;
  };
}

export interface TaskStats {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  watering_tasks: number;
  health_check_tasks: number;
  fertilizing_tasks: number;
}

export async function getTasksForDateRange(userId: string, startDate: string, endDate: string): Promise<TaskRecord[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_tasks_for_date_range', {
      p_user_id: userId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
}

export async function getMonthlyTaskStats(userId: string, year: number, month: number): Promise<TaskStats | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_monthly_task_stats', {
      p_user_id: userId,
      p_year: year,
      p_month: month,
    });

    if (error) {
      console.error('Error fetching task stats:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error loading task stats:', error);
    return null;
  }
}

export async function updateTaskStatus(
  taskId: string,
  userId: string,
  status: 'completed' | 'cancelled',
): Promise<FlowerUploadResult> {
  try {
    const supabase = await createClient();

    // Verify user owns the task
    const { data: taskData, error: checkError } = await supabase
      .from('tasks')
      .select('user_id')
      .eq('id', taskId)
      .single();

    if (checkError || !taskData || taskData.user_id !== userId) {
      return {
        success: false,
        message: 'Unauthorized or task not found',
      };
    }

    // Update the task status
    const updateData: any = { status };
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase.from('tasks').update(updateData).eq('id', taskId);

    if (updateError) {
      return {
        success: false,
        message: `Update failed: ${updateError.message}`,
      };
    }

    revalidatePath('/calendar');

    return {
      success: true,
      message: `Task ${status} successfully`,
    };
  } catch (error) {
    console.error('Error updating task:', error);
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function getUpcomingTasks(userId: string, limit: number = 5): Promise<TaskRecord[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('tasks')
      .select(
        `
        *,
        flowers!inner(name)
      `,
      )
      .eq('user_id', userId)
      .eq('status', 'scheduled')
      .gte('scheduled_date', new Date().toISOString().split('T')[0])
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true, nullsFirst: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching upcoming tasks:', error);
      return [];
    }

    return (
      data?.map((task) => ({
        ...task,
        flower_name: task.flowers?.name,
      })) || []
    );
  } catch (error) {
    console.error('Error loading upcoming tasks:', error);
    return [];
  }
}

export async function getFlowerUpdateById(scanId: string, userId: string): Promise<FlowerUpdateRecord | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('flower_updates')
      .select('*')
      .eq('id', scanId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching flower update:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error loading flower update:', error);
    return null;
  }
}

export async function getAllFlowerUpdates(userId: string): Promise<FlowerUpdateRecord[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('flower_updates')
      .select(
        `
        *,
        flowers!inner(name, image_url)
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching flower updates:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error loading flower updates:', error);
    return [];
  }
}
