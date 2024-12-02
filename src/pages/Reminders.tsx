import { motion } from "framer-motion";
import { Bell, Calendar, Mail, MessageSquare, Loader, Trash2 } from "lucide-react";
import { useReminders } from "../hooks/useReminders";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { userService } from "../services/api";

const Reminders = () => {
  const {
    reminders,
    isLoading,
    createReminder,
    updateReminder,
    deleteReminder,
  } = useReminders();

  const [notificationPrefs, setNotificationPrefs] = useState({
    push: false,
    email: false,
    sms: false,
  });

  const handleNotificationChange = async (type: 'push' | 'email' | 'sms') => {
    const newPrefs = {
      ...notificationPrefs,
      [type]: !notificationPrefs[type],
    };

    try {
      await userService.updateNotificationPreferences(newPrefs);
      setNotificationPrefs(newPrefs);
      toast.success('Notification preferences updated');
    } catch {
      toast.error('Failed to update notification preferences');
      // Revert the UI state on error
      setNotificationPrefs(notificationPrefs);
    }
  };

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await userService.getNotificationPreferences();
        setNotificationPrefs(response.data);
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
      }
    };
    loadPreferences();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Reminder Settings
      </h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Notification Preferences
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bell className="text-indigo-600" />
                  <span>Push Notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.push}
                  onChange={() => handleNotificationChange('push')}
                  className="form-checkbox h-5 w-5 text-indigo-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="text-indigo-600" />
                  <span>Email Notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.email}
                  onChange={() => handleNotificationChange('email')}
                  className="form-checkbox h-5 w-5 text-indigo-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="text-indigo-600" />
                  <span>SMS Notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.sms}
                  onChange={() => handleNotificationChange('sms')}
                  className="form-checkbox h-5 w-5 text-indigo-600"
                />
              </label>
            </div>
          </motion.div>

          {/* Active Reminders List */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Active Reminders
            </h2>
            <div className="space-y-4">
              {reminders?.map((reminder) => (
                <div 
                  key={reminder._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{reminder.type}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(reminder.date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    title="Delete Reminder"
                    onClick={() => deleteReminder(reminder._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {reminders?.length === 0 && (
                <p className="text-center text-gray-500">No active reminders</p>
              )}
            </div>
          </motion.div>

          {/* Calendar Integration Section */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-md p-6 md:col-span-2"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Calendar Integration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={async () => {
                  try {
                    await createReminder({
                      title: 'Calendar Sync',
                      description: 'Sync with Google Calendar',
                      date: new Date().toISOString(),
                      type: 'custom',
                      subscriptionId: '',
                      notificationPreferences: notificationPrefs,
                    });
                  } catch {
                    toast.error('Failed to sync with Google Calendar');
                  }
                }}
                className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:text-indigo-500 transition-colors"
              >
                <Calendar className="h-6 w-6" />
                <span>Connect Google Calendar</span>
              </button>
              <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:text-indigo-500 transition-colors">
                <Calendar className="h-6 w-6" />
                <span>Connect Apple Calendar</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Reminders;