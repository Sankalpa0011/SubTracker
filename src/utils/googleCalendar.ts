import { format } from 'date-fns';
import { GoogleCalendarEvent, GoogleCalendarResponse } from '../types/google-calendar';
import toast from 'react-hot-toast';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let isInitialized = false;

export const initGoogleCalendar = async (): Promise<void> => {
  if (isInitialized) return;

  try {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.body.appendChild(script);
    });

    await new Promise<void>((resolve) => {
      window.gapi.load('client:auth2', resolve);
    });

    await window.gapi.client.init({
      apiKey: GOOGLE_API_KEY,
      clientId: GOOGLE_CLIENT_ID,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
      scope: 'https://www.googleapis.com/auth/calendar.events'
    });

    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize Google Calendar:', error);
    toast.error('Failed to initialize Google Calendar. Please try again.');
  }
};

export const addToGoogleCalendar = async (subscription: {
  name: string;
  price: string;
  renewalDate: string;
}): Promise<GoogleCalendarResponse> => {
  if (!isInitialized) {
    await initGoogleCalendar();
  }

  try {
    const auth2 = window.gapi.auth2.getAuthInstance();
    
    if (!auth2.isSignedIn.get()) {
      // Show a message to the user before the popup
      toast.loading('Please sign in to Google Calendar...');
      
      // Handle the sign-in with proper error catching
      try {
        await auth2.signIn({
          prompt: 'select_account'
        });
      } catch (error: unknown) {
        if ((error as { error: string }).error === 'popup_blocked_by_browser') {
          toast.error('Please allow popups for this site to connect to Google Calendar');
        } else {
          toast.error('Failed to sign in to Google Calendar');
        }
        throw error;
      }
    }

    const event: GoogleCalendarEvent = {
      summary: `${subscription.name} Subscription Renewal`,
      description: `Renewal for ${subscription.name} subscription - ${subscription.price}`,
      start: {
        dateTime: format(new Date(subscription.renewalDate), "yyyy-MM-dd'T'HH:mm:ssxxx"),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: format(new Date(subscription.renewalDate), "yyyy-MM-dd'T'HH:mm:ssxxx"),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 }
        ]
      }
    };

    const response = await new Promise<GoogleCalendarResponse>((resolve, reject) => {
      window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      }).execute((jsonResp: gapi.client.calendar.Event) => {
        if (jsonResp.status !== 'confirmed') {
          reject(new Error('Failed to add event to Google Calendar'));
        } else {
          resolve(jsonResp as GoogleCalendarResponse);
        }
      });
    });

    toast.success('Successfully added event to Google Calendar!');
    return response;
  } catch (error: unknown) {
    console.error('Error adding event to Google Calendar:', error);
    
    // Handle specific error cases
    if (error instanceof Error && error.message === 'popup_blocked_by_browser') {
      toast.error('Please allow popups for this site to connect to Google Calendar');
    } else if (error instanceof Error && error.message === 'permission_denied') {
      toast.error('Permission denied. Please grant calendar access and try again.');
    } else {
      toast.error('Failed to add event to Google Calendar. Please try again.');
    }
    
    throw error;
  }
};