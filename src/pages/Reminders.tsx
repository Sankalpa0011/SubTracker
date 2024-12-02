import { motion } from 'framer-motion';
import { Bell, Calendar, Mail, MessageSquare } from 'lucide-react';

const Reminders = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Reminder Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="text-indigo-600" />
                <span>Push Notifications</span>
              </div>
              <input type="checkbox" className="form-checkbox h-5 w-5 text-indigo-600" />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="text-indigo-600" />
                <span>Email Notifications</span>
              </div>
              <input type="checkbox" className="form-checkbox h-5 w-5 text-indigo-600" />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <MessageSquare className="text-indigo-600" />
                <span>SMS Notifications</span>
              </div>
              <input type="checkbox" className="form-checkbox h-5 w-5 text-indigo-600" />
            </label>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Reminder Timing</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="text-indigo-600" />
                <span>Days Before Renewal</span>
              </div>
              <label htmlFor="daysBeforeRenewal" className="sr-only">Days Before Renewal</label>
              <select id="daysBeforeRenewal" className="input !w-24">
                <option value="1">1 day</option>
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
              </select>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Custom Reminder Schedule</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600" />
                  <span>First reminder: 7 days before</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600" />
                  <span>Second reminder: 3 days before</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600" />
                  <span>Final reminder: Day of renewal</span>
                </label>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg shadow-md p-6 md:col-span-2"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Calendar Integration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:text-indigo-500 transition-colors">
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
    </motion.div>
  );
};

export default Reminders;