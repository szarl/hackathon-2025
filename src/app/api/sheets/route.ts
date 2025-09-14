import { NextRequest, NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/services/GoogleSheetsService';

export async function GET(request: NextRequest) {
  try {
    // Extract the spreadsheet ID from your URL
    const spreadsheetId = '1l8tOf7AOCn5ee34A433Qzf-XWIkgP5KsH7MCA3GEGqc';

    const sheetsService = new GoogleSheetsService();

    // Fetch data from the spreadsheet (default range A:Z will get all data)
    const data = await sheetsService.getSheetData(spreadsheetId, 'A:Z');

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in sheets API:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch spreadsheet data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
