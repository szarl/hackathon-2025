import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';

export interface SheetData {
  values: string[][];
  range: string;
  majorDimension: string;
}

export class GoogleSheetsService {
  private sheets: any;
  private drive: any;

  constructor() {
    // Don't initialize auth in constructor to avoid async issues
  }

  private async initializeAuth() {
    try {
      let auth;

      // Check if we have stored OAuth tokens
      const tokenPath = path.join(process.cwd(), '.google-tokens.json');

      if (await this.fileExists(tokenPath)) {
        console.log('Loading stored OAuth2 tokens for Sheets...');
        const tokens = JSON.parse(await fs.readFile(tokenPath, 'utf8'));

        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID || 'your-client-id',
          process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret',
          'http://localhost/',
        );

        oauth2Client.setCredentials(tokens);

        // Check if token needs refresh
        if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
          console.log('Refreshing expired token...');
          try {
            const { credentials } = await oauth2Client.refreshAccessToken();
            oauth2Client.setCredentials(credentials);
            await fs.writeFile(tokenPath, JSON.stringify(credentials));
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            // Continue with existing token and hope it works
          }
        }

        auth = oauth2Client;
      } else {
        throw new Error('No OAuth2 tokens found. Please authenticate first.');
      }

      this.sheets = google.sheets({ version: 'v4', auth });
      this.drive = google.drive({ version: 'v3', auth });
      console.log('Google Sheets authentication initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Sheets authentication:', error);
      throw error;
    }
  }

  private async setupOAuth2() {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost/',
    );

    const scopes = [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/drive.readonly',
    ];

    // Generate auth URL and handle OAuth flow (simplified for demo)
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });

    console.log('Auth URL:', authUrl);
    // In a real implementation, you'd handle the OAuth flow properly

    return oauth2Client;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  static extractSheetId(urlOrId: string): string {
    // If it's already just an ID
    if (!urlOrId.includes('/')) {
      return urlOrId;
    }

    // Extract from Google Sheets URL
    const match = urlOrId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      return match[1];
    }

    throw new Error('Invalid Google Sheets URL or ID');
  }

  async getSheetData(spreadsheetId: string, range: string = 'A:Z'): Promise<SheetData> {
    await this.initializeAuth();

    try {
      // First try the Sheets API
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      return {
        values: response.data.values || [],
        range: response.data.range || '',
        majorDimension: response.data.majorDimension || 'ROWS',
      };
    } catch (error) {
      console.log('Sheets API failed, trying CSV export through Drive API:', error);

      // Fallback: Export as CSV through Drive API
      try {
        const response = await this.drive.files.export({
          fileId: spreadsheetId,
          mimeType: 'text/csv',
        });

        // Parse CSV data
        const csvData = response.data;
        const lines = csvData.split('\n').filter((line: string) => line.trim());
        const values = lines.map((line: string) => {
          // Simple CSV parsing (doesn't handle quoted commas)
          return line.split(',').map((cell: string) => cell.trim());
        });

        return {
          values,
          range: 'A:Z',
          majorDimension: 'ROWS',
        };
      } catch (driveError) {
        console.error('Drive API export also failed:', driveError);
        throw new Error('Failed to fetch spreadsheet data from both Sheets API and Drive API');
      }
    }
  }

  async getSheetInfo(spreadsheetId: string) {
    await this.initializeAuth();

    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
      });

      return {
        title: response.data.properties.title,
        sheets:
          response.data.sheets?.map((sheet: any) => ({
            title: sheet.properties.title,
            sheetId: sheet.properties.sheetId,
            gridProperties: sheet.properties.gridProperties,
          })) || [],
      };
    } catch (error) {
      console.error('Error fetching sheet info:', error);
      throw error;
    }
  }
}
