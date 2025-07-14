
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock notifications - in a real app, these would come from your backend
  const generateMockNotifications = (): Notification[] => [
    {
      id: '1',
      title: 'New Booking',
      message: 'Room 101 has been booked for tonight',
      type: 'success',
      read: false,
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
    },
    {
      id: '2',
      title: 'Payment Received',
      message: 'Payment of $150 received for booking #1234',
      type: 'success',
      read: false,
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutes ago
    },
    {
      id: '3',
      title: 'Low Battery Alert',
      message: 'Smart lock in Room 205 has low battery (15%)',
      type: 'warning',
      read: true,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    {
      id: '4',
      title: 'Maintenance Required',
      message: 'Room 303 requires maintenance check',
      type: 'warning',
      read: false,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
    },
    {
      id: '5',
      title: 'Guest Check-in',
      message: 'John Doe has checked into Room 102',
      type: 'info',
      read: true,
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
    }
  ];

  useEffect(() => {
    // Load mock notifications
    const mockNotifications = generateMockNotifications();
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}
