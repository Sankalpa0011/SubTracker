import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.metadata',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

export class GmailService {
  private oauth2Client: OAuth2Client;

  constructor() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials are required');
    }

    this.oauth2Client = new google.auth.OAuth2({
      clientId,
      clientSecret,
      redirectUri: `${window.location.origin}/auth/callback`,
    });
  }

  async authorize(): Promise<{ url: string }> {
    try {
      const authUrl = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        include_granted_scopes: true,
        prompt: 'consent'
      });

      return { url: authUrl };
    } catch (error) {
      console.error('Gmail auth error:', error);
      throw new Error('Failed to initialize Gmail authentication');
    }
  }

  async handleCallback(code: string): Promise<string> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      if (!tokens.access_token) {
        throw new Error('No access token received');
      }

      this.oauth2Client.setCredentials(tokens);
      return tokens.access_token;
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw new Error('Failed to complete Gmail authentication');
    }
  }

  async getUserInfo(accessToken: string) {
    try {
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw new Error('Failed to get user information');
    }
  }
}

export const gmailService = new GmailService();