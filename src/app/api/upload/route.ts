import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/services/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const uploadedUrls: string[] = [];

    // Process each file in the form data
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file-') && value instanceof File) {
        const file = value as File;

        // Validate file type
        if (!file.type.startsWith('image/')) {
          continue; // Skip non-image files
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Upload file to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage.from('flowers').upload(filePath, file);

        console.log(uploadData);
        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue; // Skip this file and continue with others
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from('flowers').getPublicUrl(filePath);

        uploadedUrls.push(urlData.publicUrl);
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid images were uploaded' });
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      message: `Successfully uploaded ${uploadedUrls.length} file(s)`,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
