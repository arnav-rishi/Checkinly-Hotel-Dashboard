
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Hotel {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  hotel_id: string;
  first_name?: string;
  last_name?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export const useHotel = () => {
  const { user } = useAuth();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setHotel(null);
      setProfile(null);
      return;
    }

    fetchHotelData();
  }, [user]);

  const fetchHotelData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching hotel data for user:', user.id);

      // First, get the user's profile to get hotel_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile not found - user needs to complete setup
          console.log('Profile not found, user needs to complete setup');
          setProfile(null);
          setHotel(null);
          return;
        } else {
          throw profileError;
        }
      }

      console.log('Profile found:', profileData);
      setProfile(profileData);

      // Then get the hotel data
      const { data: hotelData, error: hotelError } = await supabase
        .from('hotels')
        .select('*')
        .eq('id', profileData.hotel_id)
        .single();

      if (hotelError) {
        if (hotelError.code === 'PGRST116') {
          // Hotel not found - data integrity issue
          console.log('Hotel not found for profile');
          setHotel(null);
          return;
        } else {
          throw hotelError;
        }
      }

      console.log('Hotel found:', hotelData);
      setHotel(hotelData);
    } catch (err: any) {
      console.error('Error fetching hotel data:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load hotel information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateHotel = async (updates: Partial<Hotel>) => {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .update(updates)
        .eq('id', hotel?.id)
        .select()
        .single();

      if (error) throw error;

      setHotel(data);
      toast({
        title: 'Success',
        description: 'Hotel information updated successfully'
      });
    } catch (err: any) {
      console.error('Error updating hotel:', err);
      toast({
        title: 'Error',
        description: 'Failed to update hotel information',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
      throw err;
    }
  };

  return {
    hotel,
    profile,
    loading,
    error,
    updateHotel,
    updateProfile,
    refetch: fetchHotelData
  };
};
