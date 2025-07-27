
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Room = Tables<'rooms'>;

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number', { ascending: true });

      if (error) throw error;
      
      setRooms(data || []);
    } catch (err: any) {
      console.error('Error fetching rooms:', err);
      setError(err.message);
      toast({
        title: 'Error loading rooms',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const createRoom = useCallback(async (room: Omit<Room, 'id' | 'created_at' | 'updated_at' | 'hotel_id' | 'created_by'>) => {
    try {
      console.log('Creating room with data:', room);
      
      // Get user's hotel_id from their profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('hotel_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error('Unable to get user hotel information');
      }

      if (!profile.hotel_id) {
        throw new Error('No hotel associated with your account');
      }

      console.log('User hotel_id:', profile.hotel_id);

      const { data, error } = await supabase
        .from('rooms')
        .insert([{ ...room, hotel_id: profile.hotel_id }])
        .select()
        .single();

      if (error) {
        console.error('Room creation error:', error);
        throw error;
      }

      console.log('Room created successfully:', data);
      setRooms(prev => [data, ...prev]);
      
      return data;
    } catch (err: any) {
      console.error('Error in createRoom:', err);
      // Re-throw the error so the component can handle it
      throw err;
    }
  }, []);

  const updateRoom = useCallback(async (id: string, updates: Partial<Room>) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setRooms(prev => prev.map(room => 
        room.id === id ? data : room
      ));
      
      toast({
        title: 'Success',
        description: 'Room updated successfully'
      });
      
      return data;
    } catch (err: any) {
      toast({
        title: 'Error updating room',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    }
  }, []);

  const deleteRoom = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRooms(prev => prev.filter(room => room.id !== id));
      toast({
        title: 'Success',
        description: 'Room deleted successfully'
      });
    } catch (err: any) {
      toast({
        title: 'Error deleting room',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return {
    rooms,
    loading,
    error,
    refetch: fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom
  };
}
