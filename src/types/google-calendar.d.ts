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