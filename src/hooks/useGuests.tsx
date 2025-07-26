
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

type Guest = Tables<'guests'>;

export function useGuests() {
  const { user } = useAuth();
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

  const createGuest = useCallback(async (guestData: Omit<Guest, 'id' | 'created_at' | 'updated_at' | 'hotel_id'>) => {
    if (!user) {
      throw new Error('User must be logged in to create guests');
    }

    try {
      // First get the user's hotel_id from their profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('hotel_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error('Could not get user profile. Please ensure your profile is set up correctly.');
      }

      if (!profile?.hotel_id) {
        throw new Error('No hotel associated with your profile. Please contact support.');
      }

      // Create the guest with the hotel_id
      const { data, error } = await supabase
        .from('guests')
        .insert([{ 
          ...guestData, 
          hotel_id: profile.hotel_id 
        }])
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      if (data) {
        setGuests(prev => [data, ...prev]);
        toast({
          title: 'Success',
          description: 'Guest created successfully'
        });
        return data;
      }
    } catch (err: any) {
      console.error('Create guest error:', err);
      toast({
        title: 'Error creating guest',
        description: err.message || 'Failed to create guest. Please try again.',
        variant: 'destructive'
      });
      throw err;
    }
  }, [user]);

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
    if (user) {
      fetchGuests();
    }
  }, [fetchGuests, user]);

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
