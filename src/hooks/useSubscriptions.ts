import { useQuery, useMutation, useQueryClient } from 'react-query';
import { subscriptionService } from '../services/api';
import toast from 'react-hot-toast';
import { Subscription, SubscriptionInput } from '../types';
import axios from 'axios';

export const useSubscriptions = () => {
  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading, error } = useQuery(
    'subscriptions',
    async () => {
      const response = await subscriptionService.getAll();
      return response.data;
    }
  );

  const createMutation = useMutation(
    (newSubscription: SubscriptionInput) => 
      createSubscription(newSubscription),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('subscriptions');
        toast.success('Subscription added successfully');
      }
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<Subscription> }) =>
      subscriptionService.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('subscriptions');
        toast.success('Subscription updated successfully');
      }
    }
  );

  const createSubscription = async (newSubscription: SubscriptionInput) => {
    try {
      // Calculate duration based on billing cycle
      const getDuration = (billingCycle: string): number => {
        switch (billingCycle) {
          case 'weekly': return 7;
          case 'monthly': return 30;
          case 'quarterly': return 90;
          case 'yearly': return 365;
          default: return 30;
        }
      };
  
      // Calculate next billing date
      const startDate = new Date(newSubscription.startDate);
      const duration = getDuration(newSubscription.billingCycle);
      const nextDate = new Date(startDate);
      nextDate.setDate(nextDate.getDate() + duration);
  
      // Prepare subscription data with all required fields
      const subscriptionData: SubscriptionInput = {
        name: newSubscription.name,
        price: Number(newSubscription.price),
        billingCycle: newSubscription.billingCycle,
        startDate: newSubscription.startDate,
        nextBillingDate: nextDate.toISOString(),
        duration: duration,
        category: newSubscription.category,
        description: newSubscription.description || '',
        website: newSubscription.website || '',
        autoRenew: true,
        status: 'active',
      };
    
      const response = await subscriptionService.create(subscriptionData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create subscription');
      }
      throw error;
    }
  };

  return {
    subscriptions,
    isLoading,
    error,
    createSubscription: createMutation.mutate,
    updateSubscription: updateMutation.mutate,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading
  };
};

export default useSubscriptions;