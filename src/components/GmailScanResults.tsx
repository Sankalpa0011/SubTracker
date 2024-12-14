import '../polyfill';
import React from "react";
import { motion } from "framer-motion";
import { Check, X, Loader } from "lucide-react";
import { ParsedSubscription } from "../services/gmail";
import { useSubscriptions } from "../hooks/useSubscriptions";
import toast from "react-hot-toast";
import { SubscriptionInput } from "../types";

interface GmailScanResultsProps {
  results: ParsedSubscription[];
  isLoading: boolean;
  onClose: () => void;
}

const GmailScanResults: React.FC<GmailScanResultsProps> = ({
  results,
  isLoading,
  onClose,
}) => {
  const { createSubscription, isCreating } = useSubscriptions();

  const handleImport = async (subscription: ParsedSubscription) => {
    try {
      const subscriptionData: SubscriptionInput = {
        name: subscription.name,
        price: subscription.price || 0,
        billingCycle: subscription.billingCycle || "monthly",
        startDate: new Date().toISOString(),
        nextBillingDate: subscription.renewalDate || new Date().toISOString(),
        category: "Other",
        status: "active",
        autoRenew: true,
        duration: subscription.billingCycle === "monthly" ? 30 : 365,
        description: "",
        website: "",
        logo: "",
      };

      await createSubscription(subscriptionData);
      toast.success(`Imported ${subscription.name} successfully`);
    } catch (error) {
      toast.error(`Failed to import ${subscription.name}`);
      console.error("Import error:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Gmail Scan Results
          </h2>
          <button
            title="Close"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="ml-3 text-gray-600">Scanning emails...</span>
          </div>
        ) : (
          <>
            {results.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No subscriptions found in emails
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {results.map((subscription, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {subscription.name}
                      </h3>
                      <div className="text-sm text-gray-500">
                        {subscription.price && (
                          <span className="mr-4">
                            ${subscription.price.toFixed(2)}
                          </span>
                        )}
                        {subscription.billingCycle && (
                          <span className="mr-4">
                            {subscription.billingCycle}
                          </span>
                        )}
                        {subscription.renewalDate && (
                          <span>
                            Renewal:{" "}
                            {new Date(
                              subscription.renewalDate
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleImport(subscription)}
                      disabled={isCreating}
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Import
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                Close
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default GmailScanResults;
