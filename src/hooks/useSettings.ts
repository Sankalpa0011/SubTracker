import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export const useSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    theme: 'light',
    currency: 'USD'
  });

  const updateSettings = async (newSettings: Partial<typeof settings>) => {
    try {
      await api.put('/users/settings', newSettings);
      setSettings(prev => ({ ...prev, ...newSettings }));
      toast.success('Settings updated successfully');
    } catch {
      toast.error('Failed to update settings');
    }
  };

  return { settings, updateSettings };
};