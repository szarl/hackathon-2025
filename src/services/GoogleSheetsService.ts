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
      let tokens;

      // Check for individual environment variables first (production setup)
      if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        console.log('Loading OAuth2 tokens from individual environment variables...');

        // Try to load from local .google-tokens.json for development
        const tokenPath = path.join(process.cwd(), '.google-tokens.json');
        if (await this.fileExists(tokenPath)) {
          console.log('Loading tokens from local file...');
          tokens = JSON.parse(await fs.readFile(tokenPath, 'utf8'));
        } else {
          // For production, we'll try to work without tokens or use service account
          console.log('No local token file found, attempting to use OAuth2 flow...');
          throw new Error('OAuth2 tokens not available. Please authenticate locally first or use service account.');
        }

        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          'http://localhost/',
        );

        if (tokens) {
          oauth2Client.setCredentials(tokens);

          // Check if token needs refresh
          if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
            console.log('Refreshing expired token...');
            try {
              const { credentials } = await oauth2Client.refreshAccessToken();
              oauth2Client.setCredentials(credentials);

              // Try to save refreshed tokens (only works locally)
              if (await this.fileExists(tokenPath)) {
                await fs.writeFile(tokenPath, JSON.stringify(credentials));
              }
            } catch (refreshError) {
              console.error('Failed to refresh token:', refreshError);
              // Continue with existing token and hope it works
            }
          }
        }

        auth = oauth2Client;
      } else if (process.env.GOOGLE_OAUTH_TOKENS) {
        // Fallback to JSON format for backward compatibility
        console.log('Loading OAuth2 tokens from JSON environment variable...');
        tokens = JSON.parse(process.env.GOOGLE_OAUTH_TOKENS);

        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID || 'your-client-id',
          process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret',
          'http://localhost/',
        );

        oauth2Client.setCredentials(tokens);
        auth = oauth2Client;
      } else {
        throw new Error(
          'No Google OAuth2 credentials found. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.',
        );
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
    try {
      // For production environments without local tokens, try public access first
      if (!(await this.fileExists(path.join(process.cwd(), '.google-tokens.json')))) {
        console.log('No local tokens found, trying public CSV export first...');
        return await this.getPublicSheetData(spreadsheetId);
      }

      // Try authenticated methods if tokens are available
      await this.initializeAuth();

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

        // Final fallback: Try public CSV export URL (requires public sharing)
        return await this.getPublicSheetData(spreadsheetId);
      }
    }
  }

  private async getPublicSheetData(spreadsheetId: string): Promise<SheetData> {
    try {
      console.log('Trying public CSV export...');
      const publicCsvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;

      const response = await fetch(publicCsvUrl);
      if (!response.ok) {
        throw new Error(`Public CSV export failed: ${response.statusText}`);
      }

      const csvData = await response.text();
      const lines = csvData.split('\n').filter((line: string) => line.trim());
      const values = lines.map((line: string) => {
        // Simple CSV parsing (doesn't handle quoted commas)
        return line.split(',').map((cell: string) => cell.trim().replace(/^"|"$/g, ''));
      });

      console.log('✅ Successfully fetched data via public CSV export');
      return {
        values,
        range: 'A:Z',
        majorDimension: 'ROWS',
      };
    } catch (publicError) {
      console.error('Public CSV export failed:', publicError);
      throw new Error(
        'Failed to fetch spreadsheet data. Please ensure the spreadsheet is publicly accessible or check your authentication.',
      );
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
