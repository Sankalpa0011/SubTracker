import { motion } from 'framer-motion';
import { User, Lock, Bell, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="mr-2" /> Profile Information
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" defaultValue={user?.name} className="input mt-1" title='Full Name' />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" defaultValue={user?.email} className="input mt-1" title='Email' />
              </div>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </form>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Lock className="mr-2" /> Security
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input type="password" className="input mt-1" title='Current Password' />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input type="password" className="input mt-1" title='New Password' />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input type="password" className="input mt-1" title='Confirm New Password' />
              </div>
              <button type="submit" className="btn btn-primary">
                Update Password
              </button>
            </form>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="mr-2" /> Notifications
            </h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-indigo-600" />
                <span>Email notifications</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-indigo-600" />
                <span>Push notifications</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600" />
                <span>SMS notifications</span>
              </label>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="mr-2" /> Two-Factor Authentication
            </h2>
            <p className="text-gray-600 mb-4">
              Add an extra layer of security to your account by enabling two-factor authentication.
            </p>
            <button className="btn btn-primary w-full">Enable 2FA</button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;