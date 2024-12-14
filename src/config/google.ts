
interface GoogleConfig {
  client_id: string;
  scopes: string[];
}

export const GOOGLE_CONFIG: GoogleConfig = {
  client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  scopes: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/gmail.readonly'
  ]
};