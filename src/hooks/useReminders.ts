import { useQueryClient } from "react-query";
import { useQuery, useMutation } from "react-query";
import { reminderService } from "../services/api";
import { Reminder, ReminderInput } from "../types";
import toast from "react-hot-toast";

export const useReminders = () => {
  const queryClient = useQueryClient();

  const { data: reminders, isLoading } = useQuery<Reminder[]>(
    'reminders',
    async () => {
      const response = await reminderService.getAll();
      return response.data;
    }
  );

  const createReminder = useMutation(
    (data: ReminderInput) => reminderService.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('reminders');
        toast.success('Reminder set successfully');
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to create reminder');
      }
    }
  );

  const updateReminder = useMutation(
    ({ id, data }: { id: string; data: Partial<ReminderInput> }) =>
      reminderService.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('reminders');
        toast.success('Reminder updated successfully');
      }
    }
  );

  const deleteReminder = useMutation(
    (id: string) => reminderService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('reminders');
        toast.success('Reminder deleted successfully');
      }
    }
  );

  return {
    reminders,
    isLoading,
    createReminder: createReminder.mutate,
    updateReminder: updateReminder.mutate,
    deleteReminder: deleteReminder.mutate,
    isCreating: createReminder.isLoading,
    isUpdating: updateReminder.isLoading,
    isDeleting: deleteReminder.isLoading
  };
};