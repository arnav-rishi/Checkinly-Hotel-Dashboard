import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Guest = Tables<'guests'>;

export function useGuests() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setGuests(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error loading guests',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const createGuest = useCallback(async (guest: Omit<Guest, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .insert([guest])
        .select()
        .single();

      if (error) throw error;

      setGuests(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Guest created successfully'
      });
      
      return data;
    } catch (err: any) {
      toast({
        title: 'Error creating guest',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    }
  }, []);

  const updateGuest = useCallback(async (id: string, updates: Partial<Guest>) => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setGuests(prev => prev.map(guest => 
        guest.id === id ? data : guest
      ));
      
      toast({
        title: 'Success',
        description: 'Guest updated successfully'
      });
      
      return data;
    } catch (err: any) {
      toast({
        title: 'Error updating guest',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    }
  }, []);

  const deleteGuest = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGuests(prev => prev.filter(guest => guest.id !== id));
      toast({
        title: 'Success',
        description: 'Guest deleted successfully'
      });
    } catch (err: any) {
      toast({
        title: 'Error deleting guest',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  return {
    guests,
    loading,
    error,
    refetch: fetchGuests,
    createGuest,
    updateGuest,
    deleteGuest
  };
}