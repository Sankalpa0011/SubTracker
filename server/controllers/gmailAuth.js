import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.VITE_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:5000/api/auth/gmail/callback'
);

export const getGmailAuthUrl = async (req, res) => {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.metadata'
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    res.json({ url });
  } catch (error) {
    console.error('Gmail auth URL generation error:', error);
    res.status(500).json({ message: 'Failed to generate Gmail auth URL' });
  }
};

export const handleGmailCallback = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Store tokens with user
    if (req.user) {
      req.user.gmailAccessToken = tokens.access_token;
      req.user.gmailRefreshToken = tokens.refresh_token;
      await req.user.save();
    }

    res.json({ 
      success: true,
      accessToken: tokens.access_token 
    });
  } catch (error) {
    console.error('Gmail callback error:', error);
    res.status(500).json({ message: 'Gmail authorization failed' });
  }
};