import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/services/supabase/server';
import { uploadScanImageToStorage } from '@/services/actions/uploadActions';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const flowerId = formData.get('flowerId') as string;
    const userId = formData.get('userId') as string;

    if (!file || !flowerId || !userId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    // Upload the scan image
    console.log('Uploading scan image for user:', userId);
    const uploadResult = await uploadScanImageToStorage(file, userId);
    console.log('Upload result:', uploadResult);
    if (!uploadResult.success) {
      return NextResponse.json({ success: false, error: 'Failed to upload image' }, { status: 500 });
    }

    // Create initial scan record
    const { data: scanRecord, error: insertError } = await supabase
      .from('flower_updates')
      .insert({
        flower_id: flowerId,
        user_id: userId,
        scan_image_url: uploadResult.data?.public_url,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating scan record:', insertError);
      return NextResponse.json({ success: false, error: 'Failed to create scan record' }, { status: 500 });
    }

    // Process the scan with AI (this would be async in a real implementation)
    try {
      const aiAnalysis = await analyzePlantScan(file);

      // Update the scan record with AI results
      const { error: updateError } = await supabase
        .from('flower_updates')
        .update({
          ai_analysis: aiAnalysis,
          status: 'completed',
          confidence_score: aiAnalysis.confidence_score,
          issue_type: aiAnalysis.issue_type,
          issue_description: aiAnalysis.issue_description,
          recommendations: aiAnalysis.recommendations,
        })
        .eq('id', scanRecord.id);

      if (updateError) {
        console.error('Error updating scan record:', updateError);
        return NextResponse.json({ success: false, error: 'Failed to update scan record' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        scanId: scanRecord.id,
        analysis: aiAnalysis,
      });
    } catch (aiError) {
      console.error('AI analysis error:', aiError);

      // Update record with error status
      await supabase.from('flower_updates').update({ status: 'failed' }).eq('id', scanRecord.id);

      return NextResponse.json({ success: false, error: 'AI analysis failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Scan API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

async function analyzePlantScan(file: File) {
  // This is a mock AI analysis - in a real implementation, you would call your AI service
  // For now, we'll return mock data that matches the expected structure

  const mockAnalysis = {
    confidence_score: 0.82,
    issue_type: 'light',
    issue_description: 'Pale, elongated leaves suggest insufficient light exposure',
    recommendations: [
      {
        type: 'light',
        action: 'Move to brighter location (no direct sun)',
        priority: 'urgent',
        timing: 'today',
      },
      {
        type: 'water',
        action: 'Reduce watering frequency by 2 days',
        priority: 'high',
        timing: 'this_week',
      },
      {
        type: 'monitor',
        action: 'Monitor leaf color changes',
        priority: 'low',
        timing: 'ongoing',
      },
    ],
  };

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return mockAnalysis;
}
