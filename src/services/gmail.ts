import { ParsedSubscription } from '../types';

declare global {
    interface Window {
      google: typeof google;
    }
  }
  
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.metadata'
];

interface GmailMessage {
  id: string;
  payload?: {
    headers?: Array<{
      name: string;
      value: string;
    }>;
    body?: {
      data?: string;
    };
    parts?: Array<{
      mimeType: string;
      body?: {
        data?: string;
      };
    }>;
  };
}

export class GmailService {
  private tokenClient: google.accounts.oauth2.TokenClient;

  constructor() {
    this.initializeGoogleApi();
  }

  private async initializeGoogleApi(): Promise<void> {
    // Load Google Identity Services script
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: GMAIL_SCOPES.join(' '),
          callback: () => {
            // Callback will be set when needed
          },
        });
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  // Update authorize method to wait for initialization
  async authorize(): Promise<string> {
    if (!this.tokenClient) {
      await this.initializeGoogleApi();
    }

    return new Promise((resolve, reject) => {
      if (!this.tokenClient) {
        reject(new Error('Google API not initialized'));
        return;
      }

      this.tokenClient.callback = (response: google.accounts.oauth2.TokenResponse) => {
        if (response.error) {
          reject(new Error(response.error));
        }
        resolve(response.access_token);
      };

      this.tokenClient.requestAccessToken();
    });
  }

  async getSubscriptionEmails(accessToken: string): Promise<ParsedSubscription[]> {
    try {
      const messages = await this.listMessages(accessToken);
      const subscriptions = await Promise.all(
        messages.map(msg => this.getMessage(msg.id, accessToken))
      );
      
      return subscriptions
        .map(email => this.parseEmailContent(email))
        .filter((sub): sub is ParsedSubscription => sub !== null);
    } catch (error) {
      console.error('Failed to fetch subscription emails:', error);
      throw error;
    }
  }

  private async listMessages(accessToken: string): Promise<Array<{ id: string }>> {
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=subject:(subscription OR trial OR renewal)',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();
    return data.messages || [];
  }

  private async getMessage(id: string, accessToken: string): Promise<GmailMessage> {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.json();
  }

    getAuthUrl(): string {
        return this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: GMAIL_SCOPES,
        prompt: 'consent'
        });
    }

    private getEmailBody(payload: GmailMessage['payload']): string {
        if (!payload) return '';
    
        // Handle single part messages
        if (payload.body?.data) {
          return this.decodeBase64(payload.body.data);
        }
    
        // Handle multipart messages
        if (payload.parts) {
          // Find text parts
          const textParts = payload.parts.filter(
            part => part.mimeType === 'text/plain' || part.mimeType === 'text/html'
          );
    
          // Prefer plain text over HTML
          const textPart = textParts.find(part => part.mimeType === 'text/plain') || textParts[0];
    
          if (textPart?.body?.data) {
            return this.decodeBase64(textPart.body.data);
          }
        }
    
        return '';
      }
    
      private decodeBase64(encoded: string): string {
        try {
          // Replace URL-safe chars and add padding
          const safe = encoded.replace(/-/g, '+').replace(/_/g, '/');
          const padded = safe + '==='.slice((safe.length + 3) % 4);
          
          // Decode base64
          const decoded = atob(padded);
          
          // Handle UTF-8 encoding
          return decodeURIComponent(
            Array.from(decoded)
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
        } catch (error) {
          console.error('Error decoding base64:', error);
          return '';
        }
      }

    private parseEmailContent(email: GmailMessage): ParsedSubscription | null {
    try {
        if (!email.payload?.headers) {
        return null;
        }

        const headers = email.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const from = headers.find(h => h.name === 'From')?.value || '';
        const body = this.getEmailBody(email.payload);

        const subscriptionDetails = this.extractSubscriptionDetails(subject, body, from);
        
        if (!subscriptionDetails.name) {
        return null;
        }

        return subscriptionDetails;
    } catch (error) {
        console.error('Error parsing email:', error);
        return null;
    }
    }

    private extractSubscriptionDetails(
        subject: string, 
        body: string, 
        from: string
    ): ParsedSubscription {
        const patterns = {
        price: /(?:USD|EUR|\$|€)\s*(\d+(?:\.\d{2})?)/i,
        date: /(?:renewal|next payment|expiration|due).*?(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
        cycle: /(monthly|yearly|annual|quarterly|weekly)/i,
        service: /(Netflix|Spotify|Amazon|Apple|Google|Microsoft|Adobe)/i
        };

        const priceMatch = body.match(patterns.price) || subject.match(patterns.price);
        const dateMatch = body.match(patterns.date) || subject.match(patterns.date);
        const cycleMatch = body.match(patterns.cycle) || subject.match(patterns.cycle);
        const serviceMatch = from.match(patterns.service) || subject.match(patterns.service);

        const price = priceMatch ? parseFloat(priceMatch[1]) : undefined;
        const billingCycle = this.normalizeBillingCycle(cycleMatch?.[1]);
        const provider = serviceMatch?.[1] || this.extractProviderFromEmail(from);

        let confidence = 0;
        if (price) confidence += 0.3;
        if (billingCycle) confidence += 0.3;
        if (dateMatch) confidence += 0.2;
        if (provider) confidence += 0.2;


        return {
        name: provider || 'Unknown Subscription',
        price,
        billingCycle,
        renewalDate: dateMatch?.[1] ? new Date(dateMatch[1]).toISOString() : undefined,
        provider,
        confidence
        };
    }

    private normalizeBillingCycle(cycle?: string): 'monthly' | 'yearly' | 'quarterly' | 'weekly' | undefined {
        if (!cycle) return undefined;
        
        const cycleMap: Record<string, 'monthly' | 'yearly' | 'quarterly' | 'weekly'> = {
        'monthly': 'monthly',
        'annual': 'yearly',
        'yearly': 'yearly',
        'quarterly': 'quarterly',
        'weekly': 'weekly'
        };

        return cycleMap[cycle.toLowerCase()];
    }

    private extractProviderFromEmail(from: string): string {
        const emailMatch = from.match(/<(.+?)@(.+?)>/);
        if (emailMatch) {
        const domain = emailMatch[2];
        return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
        }
        return 'Unknown Provider';
    }
}

export const gmailService = new GmailService();