import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { useSubscriptions } from "../hooks/useSubscriptions";
import { z } from "zod";
import toast from "react-hot-toast";
import { Subscription } from "../types";
import axios from "axios";

const subscriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(Number(val)), "Price must be a valid number")
    .refine((val) => Number(val) >= 0, "Price must be positive"),
  billingCycle: z.enum(["monthly", "yearly", "quarterly", "weekly"]),
  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});

const calculateDuration = (billingCycle: string): number => {
  switch (billingCycle) {
    case "weekly":
      return 7;
    case "monthly":
      return 30;
    case "quarterly":
      return 90;
    case "yearly":
      return 365;
    default:
      return 30;
  }
};

const calculateNextBillingDate = (
  startDate: string,
  duration: number
): string => {
  const date = new Date(startDate);
  date.setDate(date.getDate() + duration);
  return date.toISOString();
};

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (subscription: Subscription) => void;
}

const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const { createSubscription, isCreating } = useSubscriptions();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    billingCycle: "monthly",
    startDate: "",
    category: "",
    description: "",
    website: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      billingCycle: "monthly",
      startDate: "",
      category: "",
      description: "",
      website: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = subscriptionSchema.parse(formData);
      const duration = calculateDuration(validatedData.billingCycle);
      const nextBillingDate = calculateNextBillingDate(
        validatedData.startDate,
        duration
      );

      const subscriptionData = {
        ...validatedData,
        price: Number(validatedData.price),
        duration,
        nextBillingDate,
        status: "active" as const,
        autoRenew: true,
      };

      // Create subscription
      await createSubscription(subscriptionData);
      onAdd(subscriptionData);
      onClose();
      resetForm();
      toast.success("Subscription added successfully");
    } catch (error: unknown) {
      console.error("Subscription creation error:", error);

      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => toast.error(err.message));
        return;
      }

      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to add subscription";
        toast.error(message);
        return;
      }

      toast.error("An unexpected error occurred");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={onClose}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Add New Subscription
                </h2>
                <button
                  type="button"
                  title="Close"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Service Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input mt-1"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Netflix, Spotify"
                    disabled={isCreating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    step="0.01"
                    min="0.01"
                    className="input mt-1"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    title="Price"
                    disabled={isCreating}
                  />
                </div>

                <div>
                  <label
                    htmlFor="billingCycle"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Billing Cycle
                  </label>
                  <select
                    id="billingCycle"
                    name="billingCycle"
                    required
                    className="input mt-1"
                    value={formData.billingCycle}
                    onChange={handleChange}
                    disabled={isCreating}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    className="input mt-1"
                    value={formData.startDate}
                    onChange={handleChange}
                    disabled={isCreating}
                    title="Start Date"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    required
                    className="input mt-1"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g., Entertainment, Productivity"
                    disabled={isCreating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Website (optional)
                  </label>
                  <input
                    type="url"
                    name="website"
                    className="input mt-1"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    disabled={isCreating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description (optional)
                  </label>
                  <textarea
                    name="description"
                    className="input mt-1"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Add a description..."
                    disabled={isCreating}
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      onClose();
                    }}
                    className="btn btn-secondary"
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex items-center"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Subscription
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddSubscriptionModal;
