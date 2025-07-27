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

  const createGuest = useCallback(async (guestData: Omit<Guest, 'id' | 'created_at' | 'updated_at' | 'hotel_id'>, roomId?: string) => {
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
      const { data: guestResult, error: guestError } = await supabase
        .from('guests')
        .insert([{ 
          ...guestData, 
          hotel_id: profile.hotel_id 
        }])
        .select()
        .single();

      if (guestError) {
        console.error('Guest insert error:', guestError);
        throw guestError;
      }

      // If a room is selected, create a booking for the guest
      if (roomId && guestResult) {
        const checkInDate = new Date().toISOString().split('T')[0];
        const checkOutDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Get room details for pricing
        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select('price_per_night')
          .eq('id', roomId)
          .single();

        if (roomError) {
          console.error('Room fetch error:', roomError);
          // Continue without booking if room fetch fails
        } else {
          // Create booking
          const { error: bookingError } = await supabase
            .from('bookings')
            .insert([{
              guest_id: guestResult.id,
              room_id: roomId,
              check_in_date: checkInDate,
              check_out_date: checkOutDate,
              total_amount: roomData.price_per_night,
              status: 'confirmed'
            }]);

          if (bookingError) {
            console.error('Booking creation error:', bookingError);
            // Continue even if booking creation fails
          } else {
            // Update room status to occupied
            await supabase
              .from('rooms')
              .update({ status: 'occupied' })
              .eq('id', roomId);
          }
        }
      }

      setGuests(prev => [guestResult, ...prev]);
      toast({
        title: 'Success',
        description: roomId ? 'Guest created and room assigned successfully' : 'Guest created successfully'
      });
      return guestResult;
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
