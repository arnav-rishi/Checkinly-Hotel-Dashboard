
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Booking = Tables<'bookings'>;

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          guests(first_name, last_name, email),
          rooms(room_number, room_type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setBookings(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error loading bookings',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (booking: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([booking])
        .select(`
          *,
          guests(first_name, last_name, email),
          rooms(room_number, room_type)
        `)
        .single();

      if (error) throw error;

      setBookings(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Booking created successfully'
      });
      
      return data;
    } catch (err: any) {
      toast({
        title: 'Error creating booking',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    }
  }, []);

  const updateBooking = useCallback(async (id: string, updates: Partial<Booking>) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          guests(first_name, last_name, email),
          rooms(room_number, room_type)
        `)
        .single();

      if (error) throw error;

      setBookings(prev => prev.map(booking => 
        booking.id === id ? data : booking
      ));
      
      toast({
        title: 'Success',
        description: 'Booking updated successfully'
      });
      
      return data;
    } catch (err: any) {
      toast({
        title: 'Error updating booking',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    }
  }, []);

  const deleteBooking = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBookings(prev => prev.filter(booking => booking.id !== id));
      toast({
        title: 'Success',
        description: 'Booking deleted successfully'
      });
    } catch (err: any) {
      toast({
        title: 'Error deleting booking',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
    createBooking,
    updateBooking,
    deleteBooking
  };
}
