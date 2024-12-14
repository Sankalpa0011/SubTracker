import { ParsedSubscription } from '../types';

declare global {
    interface Window {
      google: typeof google;
    }
  }
  
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.metadata',
  'https://www.googleapis.com/auth/userinfo.email'
];

const SUBSCRIPTION_KEYWORDS = [
    // Common subscription terms
    'subscription', 'subscribed', 'subscriber',
    'membership', 'member',
    'billing', 'billed', 
    'payment', 'paid',
    'invoice', 'receipt',
    'renewal', 'renew',
    'trial', 'free trial',
    'activated', 'activation',
    'welcome to',
    'account created',
    'thank you for subscribing',
    'subscription confirmation',
    'payment confirmation',
    'monthly plan',
    'annual plan',
    'your plan',
  
    // Popular services
    'netflix', 'spotify', 'amazon prime', 
    'disney+', 'hulu', 'hbo max',
    'youtube premium', 'youtube music',
    'apple music', 'apple tv+', 'icloud',
    'microsoft', 'office 365', 'xbox',
    'playstation plus', 'playstation now',
    'nintendo switch online',
    'adobe creative cloud', 'adobe',
    'dropbox', 'google one', 'google drive',
    'github', 'atlassian', 'slack',
    'zoom', 'notion', 'evernote',
  
    // Streaming services
    'paramount+', 'peacock', 'crunchyroll',
    'funimation', 'discovery+', 'espn+',
  
    // News/Media
    'new york times', 'wall street journal',
    'washington post', 'medium', 'substack',
  
    // Software/Gaming
    'steam', 'epic games', 'ea play',
    'ubisoft+', 'discord nitro',
  
    // Fitness/Wellness
    'peloton', 'fitbit premium', 'strava',
    'calm', 'headspace', 'myfitnesspal'
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

interface TokenInfo {
    access_token: string;
    expires_at: number;  // Timestamp
  }

  export class GmailService {
    private tokenClient: google.accounts.oauth2.TokenClient;
    private accessToken: string | null = null;
  
    constructor() {
      this.initializeGoogleApi();
    }
  
    private async initializeGoogleApi(): Promise<void> {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => {
          this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            scope: GMAIL_SCOPES.join(' '),
            callback: (response) => {
              if (response.error) {
                reject(response.error);
              } else {
                this.accessToken = response.access_token;
                resolve();
              }
            },
          });
          resolve();
        };
        script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
        document.head.appendChild(script);
      });
    }

    // private storeToken(token: string) {
    //     const tokenInfo: TokenInfo = {
    //     access_token: token,
    //     expires_at: Date.now() + (3600 * 1000) // Token expires in 1 hour
    //     };
    //     localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify(tokenInfo));
    // }

    private getStoredToken(): string | null {
        const stored = localStorage.getItem(this.TOKEN_STORAGE_KEY);
        if (!stored) return null;

        const tokenInfo: TokenInfo = JSON.parse(stored);
        if (Date.now() >= tokenInfo.expires_at) {
        localStorage.removeItem(this.TOKEN_STORAGE_KEY);
        return null;
        }
        return tokenInfo.access_token;
    }

    public isAuthenticated(): boolean {
        return !!this.getStoredToken();
    }

    async authorize(): Promise<string> {
        return new Promise((resolve, reject) => {
          try {
            this.tokenClient.requestAccessToken({
              prompt: 'consent',
            });
            
            const checkToken = setInterval(() => {
              if (this.accessToken) {
                clearInterval(checkToken);
                resolve(this.accessToken);
              }
            }, 100);
    
          } catch (error) {
            reject(error);
          }
        });
      }

    async getSubscriptionEmails(accessToken: string): Promise<ParsedSubscription[]> {
    try {
        // Get message IDs
        const messages = await this.searchSubscriptionEmails(accessToken);
        console.log('Found messages:', messages.length);
        
        // Process each message and extract subscription info
        const subscriptions = messages
        .map(email => this.parseEmailContent(email))
        .filter((sub): sub is ParsedSubscription => 
            sub !== null && 
            sub.confidence > 0.5 && 
            sub.price !== undefined
        );

        console.log('Parsed subscriptions:', subscriptions);
        return subscriptions;
    } catch (error) {
        console.error('Failed to fetch subscription emails:', error);
        throw error;
    }
    }

    async searchSubscriptionEmails(accessToken: string): Promise<GmailMessage[]> {
        try {
          const query = encodeURIComponent('subject:(subscription OR payment)');
          const response = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=50`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
              },
            }
          );
    
          if (!response.ok) {
            throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
          }
    
          const data = await response.json();
          
          // Get full message details
          const messages = await Promise.all(
            (data.messages || []).map(async (msg: { id: string }) => {
              const msgResponse = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
                {
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                  },
                }
              );
              return msgResponse.json();
            })
          );
    
          return messages;
        } catch (error) {
          console.error('Gmail search error:', error);
          throw new Error('Failed to search Gmail messages');
        }
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
            date: /(?:renewal|next payment|expiration|due|next billing).*?(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
            cycle: /(monthly|yearly|annual|quarterly|weekly|month|year|quarter|week)/i,
            service: new RegExp(SUBSCRIPTION_KEYWORDS.join('|'), 'i')
        };
    
        // Look in both subject and body
        const fullText = `${subject}\n${body}`;
        
        const priceMatch = fullText.match(patterns.price) || subject.match(patterns.price);
        const dateMatch = fullText.match(patterns.date) || subject.match(patterns.date);
        const cycleMatch = fullText.match(patterns.cycle) || subject.match(patterns.cycle);
        const serviceMatch = from.match(patterns.service) || subject.match(patterns.service);
    
        const price = priceMatch ? parseFloat(priceMatch[1]) : undefined;
        const billingCycle = this.normalizeBillingCycle(cycleMatch?.[1]);
        const provider = serviceMatch?.[1] || this.extractProviderFromEmail(from);
    
        // Increase confidence based on matches
        let confidence = 0;
        if (priceMatch) confidence += 0.3;
        if (billingCycle) confidence += 0.2;
        if (dateMatch) confidence += 0.2;
        if (provider) confidence += 0.2;
        if (fullText.toLowerCase().includes('subscription')) confidence += 0.1;
    
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