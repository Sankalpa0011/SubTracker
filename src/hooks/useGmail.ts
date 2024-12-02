import { useState } from 'react';
import { gmailAuthService } from '../services/api';
import toast from 'react-hot-toast';

export const useGmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionEmails, setSubscriptionEmails] = useState([]);

  const connectGmail = async () => {
    try {
      setIsLoading(true);
      const { data } = await gmailAuthService.authorize();
      window.location.href = data.url;
    } catch (error) {
      console.error('Gmail connection error:', error);
      toast.error('Failed to connect to Gmail');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscriptionEmails = async () => {
    try {
      setIsLoading(true);
      const { data } = await gmailAuthService.getSubscriptions();
      setSubscriptionEmails(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch subscription emails:', error);
      toast.error('Failed to fetch subscription emails');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    subscriptionEmails,
    connectGmail,
    fetchSubscriptionEmails
  };
};