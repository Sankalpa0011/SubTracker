import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Calendar, Bell, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addToGoogleCalendar } from "../utils/googleCalendar";
import { useGmail } from "../hooks/useGmail";
import { useSubscriptions } from "../hooks/useSubscriptions";
import GmailScanResults from "./GmailScanResults";
import toast from "react-hot-toast";

interface QuickActionsProps {
  onAddSubscription: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = () => {
  const navigate = useNavigate();
  const [showScanResults, setShowScanResults] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const { connectGmail, isLoading, subscriptionEmails } = useGmail();
  const { subscriptions } = useSubscriptions();

  useEffect(() => {
    // Check if calendar was previously connected
    const calendarConnected = localStorage.getItem("googleCalendarConnected");
    setIsCalendarConnected(calendarConnected === "true");
  }, []);

  const handleCalendarConnect = async () => {
    if (isConnecting) return;

    setIsConnecting(true);
    try {
      // Test connection with a dummy event
      await addToGoogleCalendar({
        name: "Test Connection",
        price: "$0",
        renewalDate: new Date().toISOString(),
      });

      setIsCalendarConnected(true);
      localStorage.setItem("googleCalendarConnected", "true");
      toast.success("Successfully connected to Google Calendar!");
    } catch (error) {
      console.error("Calendar connection failed:", error);
      toast.error("Failed to connect to Google Calendar");
    } finally {
      setIsConnecting(false);
    }
  };

  const syncSubscriptionsToCalendar = async () => {
    if (!subscriptions?.length) {
      toast.error("No subscriptions to sync");
      return;
    }

    setIsConnecting(true);
    try {
      let syncedCount = 0;
      for (const sub of subscriptions) {
        try {
          await addToGoogleCalendar({
            name: sub.name,
            price: `$${sub.price}`,
            renewalDate: sub.renewalDate || sub.nextBillingDate,
          });
          syncedCount++;
        } catch (error) {
          console.error(`Failed to sync ${sub.name}:`, error);
        }
      }

      toast.success(`Successfully synced ${syncedCount} subscriptions to calendar!`);
    } catch {
      toast.error("Failed to sync some subscriptions");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSetReminder = () => {
    navigate("/reminders");
  };

  const handleGetSupport = () => {
    navigate("/support");
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={connectGmail}
          disabled={isLoading}
          className={`p-4 ${
            isLoading
              ? "bg-gray-100 text-gray-500"
              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
          } rounded-lg transition-colors`}
        >
          <Mail className="h-6 w-6 mx-auto mb-2" />
          <span className="text-sm font-medium">
            {isLoading ? "Connecting..." : "Scan Gmail"}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={isCalendarConnected ? syncSubscriptionsToCalendar : handleCalendarConnect}
          disabled={isConnecting}
          className={`p-4 ${
            isConnecting
              ? "bg-gray-100 text-gray-500"
              : "bg-green-50 text-green-700 hover:bg-green-100"
          } rounded-lg transition-colors`}
        >
          <Calendar className="h-6 w-6 mx-auto mb-2" />
          <span className="text-sm font-medium">
          {isConnecting
              ? "Processing..."
              : isCalendarConnected
              ? "Sync Subscriptions"
              : "Connect Calendar"}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSetReminder}
          className="p-4 bg-yellow-50 rounded-lg text-yellow-700 hover:bg-yellow-100 transition-colors"
        >
          <Bell className="h-6 w-6 mx-auto mb-2" />
          <span className="text-sm font-medium">Set Reminder</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGetSupport}
          className="p-4 bg-purple-50 rounded-lg text-purple-700 hover:bg-purple-100 transition-colors"
        >
          <HelpCircle className="h-6 w-6 mx-auto mb-2" />
          <span className="text-sm font-medium">Get Support</span>
        </motion.button>
      </div>
      {showScanResults && (
        <GmailScanResults
          results={subscriptionEmails}
          isLoading={isLoading}
          onClose={() => setShowScanResults(false)}
        />
      )}
    </>
  );
};

export default QuickActions;
