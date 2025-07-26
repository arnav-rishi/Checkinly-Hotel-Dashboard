
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SmartLock {
  id: string;
  room_id: string;
  lock_id: string;
  status: string;
  battery_level?: number;
  signal_strength?: number;
  last_heartbeat?: string;
  last_ping?: string;
  type?: string;
  error_message?: string;
  hotel_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useSmartLocks = () => {
  const [smartLocks, setSmartLocks] = useState<SmartLock[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchSmartLocks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('smart_locks')
        .select(`
          *,
          rooms!inner(room_number)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSmartLocks(data || []);
    } catch (error: any) {
      console.error('Error fetching smart locks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load smart locks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createSmartLock = async (lockData: Omit<SmartLock, 'id' | 'created_at' | 'updated_at' | 'hotel_id' | 'created_by'>) => {
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('smart_locks')
        .insert([lockData])
        .select()
        .single();

      if (error) throw error;

      await fetchSmartLocks();
      toast({
        title: 'Success',
        description: 'Smart lock created successfully',
      });
      return data;
    } catch (error: any) {
      console.error('Error creating smart lock:', error);
      toast({
        title: 'Error',
        description: 'Failed to create smart lock',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const updateSmartLock = async (id: string, updates: Partial<SmartLock>) => {
    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from('smart_locks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          last_ping: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setSmartLocks(prev => prev.map(lock => 
        lock.id === id ? { ...lock, ...data } : lock
      ));
      
      toast({
        title: 'Success',
        description: 'Smart lock updated successfully',
      });
      return data;
    } catch (error: any) {
      console.error('Error updating smart lock:', error);
      toast({
        title: 'Error',
        description: 'Failed to update smart lock',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const deleteSmartLock = async (id: string) => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('smart_locks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSmartLocks(prev => prev.filter(lock => lock.id !== id));
      toast({
        title: 'Success',
        description: 'Smart lock deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting smart lock:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete smart lock',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  const updateLockStatus = async (id: string, status: 'locked' | 'unlocked') => {
    return updateSmartLock(id, { 
      status, 
      last_heartbeat: new Date().toISOString(),
      last_ping: new Date().toISOString()
    });
  };

  useEffect(() => {
    fetchSmartLocks();
  }, []);

  return {
    smartLocks,
    loading,
    creating,
    updating,
    deleting,
    fetchSmartLocks,
    createSmartLock,
    updateSmartLock,
    deleteSmartLock,
    updateLockStatus,
  };
};
