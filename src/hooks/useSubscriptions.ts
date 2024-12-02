import { useQuery, useMutation, useQueryClient } from 'react-query';
import { subscriptionService } from '../services/api';
import toast from 'react-hot-toast';
import { Subscription, SubscriptionInput } from '../types';

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
      subscriptionService.create(newSubscription),
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