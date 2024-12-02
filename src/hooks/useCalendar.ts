import toast from "react-hot-toast";
import { Subscription } from "../types";
import { addToGoogleCalendar } from "../utils/googleCalendar";

export const useCalendar = () => {
  const addToCalendar = async (subscription: Subscription) => {
    try {
      await addToGoogleCalendar({
        name: subscription.name,
        price: subscription.price.toString(),
        renewalDate: subscription.nextBillingDate
      });
      toast.success('Added to calendar successfully');
    } catch (error) {
      console.error('Calendar error:', error);
      toast.error('Failed to add to calendar');
    }
  };

  return { addToCalendar };
};