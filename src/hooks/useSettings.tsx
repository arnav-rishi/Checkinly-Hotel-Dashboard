
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface HotelSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  timezone: string;
}

interface NotificationSettings {
  checkIns: boolean;
  payments: boolean;
  maintenance: boolean;
  security: boolean;
  lowBattery: boolean;
}

export const useSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveHotelSettings = async (settings: HotelSettings) => {
    setSaving(true);
    try {
      // For now, we'll simulate saving to localStorage since we don't have a settings table
      // In a real app, you'd create a settings table in Supabase
      localStorage.setItem('hotel_settings', JSON.stringify(settings));
      
      toast({
        title: 'Success',
        description: 'Hotel settings saved successfully',
      });
      return true;
    } catch (error: any) {
      console.error('Error saving hotel settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save hotel settings',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationSettings = async (settings: NotificationSettings) => {
    setSaving(true);
    try {
      // For now, we'll simulate saving to localStorage
      localStorage.setItem('notification_settings', JSON.stringify(settings));
      
      toast({
        title: 'Success',
        description: 'Notification settings saved successfully',
      });
      return true;
    } catch (error: any) {
      console.error('Error saving notification settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification settings',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const loadHotelSettings = (): HotelSettings => {
    try {
      const saved = localStorage.getItem('hotel_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading hotel settings:', error);
    }
    
    // Default settings
    return {
      name: 'Grand Plaza Hotel',
      address: '123 Main Street, City, State 12345',
      phone: '+1 (555) 123-4567',
      email: 'info@grandplaza.com',
      timezone: 'UTC-5 (Eastern)'
    };
  };

  const loadNotificationSettings = (): NotificationSettings => {
    try {
      const saved = localStorage.getItem('notification_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
    
    // Default settings
    return {
      checkIns: true,
      payments: true,
      maintenance: false,
      security: true,
      lowBattery: true
    };
  };

  return {
    loading,
    saving,
    saveHotelSettings,
    saveNotificationSettings,
    loadHotelSettings,
    loadNotificationSettings,
  };
};
