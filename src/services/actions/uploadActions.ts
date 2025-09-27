'use server';

import { createClient } from '../supabase/server';
import { revalidatePath } from 'next/cache';

export interface UploadResult {
  success: boolean;
  message: string;
  data?: {
    id: string;
    file_path: string;
    public_url: string;
  };
}

export async function uploadImageToStorage(file: File, userId: string): Promise<UploadResult> {
  try {
    const supabase = await createClient();

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('not image type');
      return {
        success: false,
        message: `${file.name} is not an image file`,
      };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/scans/${fileName}`;

    // Upload file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from('flowers').upload(filePath, file);

    if (uploadError) {
      console.log(uploadError);
      return {
        success: false,
        message: `Upload failed: ${uploadError.message}`,
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('flowers').getPublicUrl(filePath);

    // Save file metadata to database
    const { data: dbData, error: dbError } = await supabase
      .from('flower_updates')
      .insert({
        user_id: userId,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        uploaded_at: new Date().toISOString(),
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

    revalidatePath('/upload');

    return {
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: dbData.id,
        file_path: filePath,
        public_url: urlData.publicUrl,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function deleteImageFromStorage(imageId: string, filePath: string, userId: string): Promise<UploadResult> {
  try {
    const supabase = await createClient();

    // Verify user owns the image
    const { data: imageData, error: checkError } = await supabase
      .from('flower_updates')
      .select('user_id')
      .eq('id', imageId)
      .single();

    if (checkError || !imageData || imageData.user_id !== userId) {
      return {
        success: false,
        message: 'Unauthorized or image not found',
      };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage.from('flowers').remove([filePath]);

    if (storageError) {
      return {
        success: false,
        message: `Storage deletion failed: ${storageError.message}`,
      };
    }

    // Delete from database
    const { error: dbError } = await supabase.from('flower_updates').delete().eq('id', imageId);

    if (dbError) {
      return {
        success: false,
        message: `Database deletion failed: ${dbError.message}`,
      };
    }

    revalidatePath('/upload');

    return {
      success: true,
      message: 'Image deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function uploadScanImageToStorage(file: File, userId: string): Promise<UploadResult> {
  try {
    const supabase = await createClient();

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('not image type');
      return {
        success: false,
        message: `${file.name} is not an image file`,
      };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/scans/${fileName}`;

    // Upload file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from('flowers').upload(filePath, file);

    if (uploadError) {
      console.log(uploadError);
      return {
        success: false,
        message: `Upload failed: ${uploadError.message}`,
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('flowers').getPublicUrl(filePath);

    return {
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: uploadData.path, // Use the file path as ID since we're not storing in DB yet
        file_path: filePath,
        public_url: urlData.publicUrl,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function getUserImages(userId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('flower_updates')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Add public URLs to the images
    const imagesWithUrls = data.map((image) => {
      const { data: urlData } = supabase.storage.from('flowers').getPublicUrl(image.file_path);

      return {
        ...image,
        public_url: urlData.publicUrl,
      };
    });

    return imagesWithUrls;
  } catch (error) {
    console.error('Error loading images:', error);
    return [];
  }
}
