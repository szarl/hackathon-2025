import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/services/supabase/server';
import { uploadFlowerImage } from '@/services/actions/flowerActions';

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
    const uploadResults: any[] = [];
    const errors: string[] = [];

    // Process each file in the form data
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file-') && value instanceof File) {
        const file = value as File;

        try {
          const result = await uploadFlowerImage(file, user.id);

          if (result.success) {
            uploadResults.push({
              name: file.name,
              ...result.data,
            });
          } else {
            errors.push(`${file.name}: ${result.message}`);
          }
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          errors.push(`${file.name}: Processing failed`);
        }
      }
    }

    console.log('Upload results:', uploadResults);
    console.log('Errors:', errors);

    if (uploadResults.length === 0 && errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid flower images were uploaded',
        details: errors,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${uploadResults.length} flower image(s)`,
      data: uploadResults,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Flower upload API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
