import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Calendar, Bell, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addToGoogleCalendar } from "../utils/googleCalendar";
import { useSubscriptions } from "../hooks/useSubscriptions";
import GmailScanResults from "./GmailScanResults";
import toast from "react-hot-toast";
import { useGmailScanner } from "../hooks/useGmailScanner";
import { useGmail } from "../hooks/useGmail";

interface QuickActionsProps {
  onAddSubscription: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = () => {
  const navigate = useNavigate();
  const [showScanResults, setShowScanResults] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const { subscriptions } = useSubscriptions();
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const { connectGmail, isLoading: isGmailLoading } = useGmail();
  const { isScanning, scanEmails } = useGmailScanner();

  useEffect(() => {
    // Check if Gmail was previously connected
    const gmailConnected = localStorage.getItem("gmailConnected");
    setIsGmailConnected(gmailConnected === "true");
  }, []);

  const handleGmailAction = async () => {
    if (!isGmailConnected) {
      try {
        await connectGmail();
        setIsGmailConnected(true);
        localStorage.setItem("gmailConnected", "true");
        toast.success("Successfully connected to Gmail!");
      } catch (error) {
        console.error("Gmail connection error:", error);
        toast.error("Failed to connect to Gmail");
      }
      return;
    }

    try {
      const accessToken = localStorage.getItem("gmail_access_token");
      if (!accessToken) {
        throw new Error("No Gmail access token found");
      }

      await scanEmails(accessToken);
      setShowScanResults(true);
    } catch (error) {
      console.error("Gmail scan error:", error);
      if (error.message.includes("auth")) {
        setIsGmailConnected(false);
        localStorage.removeItem("gmailConnected");
        localStorage.removeItem("gmail_access_token");
        toast.error("Gmail connection expired. Please reconnect.");
      } else {
        toast.error("Failed to scan Gmail. Please try again.");
      }
    }
  };

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

      toast.success(
        `Successfully synced ${syncedCount} subscriptions to calendar!`
      );
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
          onClick={handleGmailAction}
          disabled={isGmailLoading || isScanning}
          className={`p-4 ${
            isGmailLoading || isScanning
              ? "bg-gray-100 text-gray-500"
              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
          } rounded-lg transition-colors`}
        >
          <Mail className="h-6 w-6 mx-auto mb-2" />
          <span className="text-sm font-medium">
            {isGmailLoading || isScanning ? (
              <>
                <span className="inline-block animate-spin mr-2">⌛</span>
                {isScanning ? "Scanning..." : "Connecting..."}
              </>
            ) : isGmailConnected ? (
              "Scan Gmail"
            ) : (
              "Connect Gmail"
            )}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={
            isCalendarConnected
              ? syncSubscriptionsToCalendar
              : handleCalendarConnect
          }
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
          results={results} // Use results from useGmailScanner
          isLoading={isScanning} // Use isScanning from useGmailScanner
          onClose={() => setShowScanResults(false)}
        />
      )}
    </>
  );
};

export default QuickActions;
