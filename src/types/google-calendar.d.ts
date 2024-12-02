declare global {
  interface Window {
    gapi: typeof gapi;
  }
}

export interface GoogleCalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  reminders: {
    useDefault: boolean;
    overrides: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

export interface GoogleCalendarResponse {
  id: string;
  status: string;
  htmlLink: string;
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

declare namespace google.accounts.oauth2 {
  interface TokenClientConfig {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
    prompt?: 'none' | 'consent' | 'select_account';
  }

  interface TokenClient {
    callback: (response: TokenResponse) => void;
    requestAccessToken(options?: {
      prompt?: 'consent' | 'select_account' | 'none';
    }): void;
  }

  interface TokenResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
    error?: string;
    error_description?: string;
    error_uri?: string;
  }

  function initTokenClient(config: TokenClientConfig): TokenClient;
}

declare namespace google.accounts {
  const oauth2: typeof google.accounts.oauth2;
}