export interface Subscription {
  _id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly' | 'quarterly' | 'weekly';
  startDate: string;
  nextBillingDate: string;
  category: string;
  description?: string;
  website?: string;
  logo?: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  autoRenew: boolean;
  renewalDate?: string;
  duration: number;
}

export const sub: Subscription = {
  id: '',
  name: '',
  price: 0,
  billingCycle: 'monthly',
  startDate: '',
  nextBillingDate: '',
  category: '',
  description: '',
  website: '',
  logo: '',
  status: 'active',
  autoRenew: false,
  total: 0,
};

export interface User {
  _id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
}

export interface AuthResponse {
  token: string;
  _id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
}

export interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms?: boolean;
}

interface AuthError {
  message: string;
  errors?: Array<{ msg: string }>;
}

export interface ReminderInput {
  subscriptionId: string;
  date: string;
  type: ReminderType;
  message?: string;
  notificationPreferences: NotificationPreferences;
  title: string;
  description: string;
}

export interface Reminder {
  _id: string;
  subscriptionId: string;
  userId: string;
  date: string;
  type: ReminderType;
  message?: string;
  status: ReminderStatus;
  notificationPreferences: NotificationPreferences;
  createdAt: string;
  updatedAt: string;
}

export type ReminderType = 'renewal' | 'payment' | 'expiration' | 'custom';
export type ReminderStatus = 'pending' | 'sent' | 'snoozed' | 'cancelled';
