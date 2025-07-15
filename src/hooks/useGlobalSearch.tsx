
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSearch } from '@/contexts/SearchContext';

export const useGlobalSearch = () => {
  const { searchQuery, setSearchResults, setIsSearching } = useSearch();
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const searchTerm = `%${query.toLowerCase()}%`;
      
      // Search rooms
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('id, room_number, room_type, status')
        .or(`room_number.ilike.${searchTerm},room_type.ilike.${searchTerm}`);

      // Search guests
      const { data: guests, error: guestsError } = await supabase
        .from('guests')
        .select('id, first_name, last_name, email')
        .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`);

      // Search bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id, 
          status,
          guests (first_name, last_name),
          rooms (room_number)
        `)
        .or(`status.ilike.${searchTerm}`);

      if (roomsError) throw roomsError;
      if (guestsError) throw guestsError;
      if (bookingsError) throw bookingsError;

      const results = [
        ...(rooms || []).map(room => ({
          type: 'room' as const,
          id: room.id,
          title: `Room ${room.room_number}`,
          description: `${room.room_type} - ${room.status}`,
          url: '/rooms'
        })),
        ...(guests || []).map(guest => ({
          type: 'guest' as const,
          id: guest.id,
          title: `${guest.first_name} ${guest.last_name}`,
          description: guest.email,
          url: '/guests'
        })),
        ...(bookings || []).map(booking => ({
          type: 'booking' as const,
          id: booking.id,
          title: `Booking - ${booking.guests?.first_name} ${booking.guests?.last_name}`,
          description: `Room ${booking.rooms?.room_number} - ${booking.status}`,
          url: '/calendar'
        }))
      ];

      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [setSearchResults, setIsSearching]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, performSearch]);

  return { error };
};
