import { useState } from 'react';
import { gmailService } from '../services/gmail';
import { useSubscriptions } from './useSubscriptions';
import toast from 'react-hot-toast';

export const useGmailScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const { createSubscription } = useSubscriptions();

  const scanEmails = async (accessToken: string) => {
    setIsScanning(true);
    try {
      const subscriptions = await gmailService.getSubscriptionEmails(accessToken);

      if (subscriptions.length === 0) {
        toast('No subscription emails found');
        return [];
      }

      // Filter valid subscriptions and add them
      const validSubscriptions = subscriptions.filter(
        sub => sub && sub.name && sub.price && sub.confidence > 0.7
      );

      if (validSubscriptions.length === 0) {
        toast('No valid subscriptions found in emails');
        return [];
      }

      let addedCount = 0;
      for (const sub of validSubscriptions) {
        try {
          await createSubscription({
            name: sub.name,
            price: sub.price,
            billingCycle: sub.billingCycle || 'monthly',
            startDate: new Date().toISOString(),
            nextBillingDate: sub.renewalDate || new Date().toISOString(),
            category: 'Imported',
            status: 'active',
            autoRenew: true,
            duration: sub.billingCycle === 'monthly' ? 30 : 365,
            description: `Imported from Gmail - ${sub.provider || 'Unknown Provider'}`,
            website: '',
            logo: ''
          });
          addedCount++;
        } catch (error) {
          console.error(`Failed to add subscription: ${sub.name}`, error);
        }
      }

      if (addedCount > 0) {
        toast.success(`Successfully imported ${addedCount} subscriptions!`);
      }

      return validSubscriptions;
    } catch (error) {
      console.error('Gmail scan failed:', error);
      throw error;
    } finally {
      setIsScanning(false);
    }
  };

  return {
    isScanning,
    scanEmails
  };
};