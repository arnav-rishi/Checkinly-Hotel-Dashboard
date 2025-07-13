import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

export function useApi<T = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async (
    apiCall: () => Promise<T>,
    options: UseApiOptions = {}
  ) => {
    const {
      onSuccess,
      onError,
      showSuccessToast = true,
      showErrorToast = true,
      successMessage = 'Operation completed successfully'
    } = options;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      
      if (showSuccessToast) {
        toast({
          title: 'Success',
          description: successMessage,
        });
      }
      
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      
      if (showErrorToast) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
      
      onError?.(errorMessage);
      throw error;
    }
  }, []);

  return {
    ...state,
    execute
  };
}

// Mock API functions - replace with real API calls
export const mockApi = {
  // Rooms API
  getRooms: () => new Promise(resolve => 
    setTimeout(() => resolve([
      { id: '1', number: '101', type: 'Standard', status: 'available', guest: null, price: 120 },
      { id: '2', number: '102', type: 'Deluxe', status: 'occupied', guest: 'John Doe', price: 180 },
      { id: '3', number: '201', type: 'Suite', status: 'maintenance', guest: null, price: 250 }
    ]), 800)
  ),

  updateRoom: (id: string, data: any) => new Promise(resolve => 
    setTimeout(() => resolve({ id, ...data }), 600)
  ),

  // Guests API
  getGuests: () => new Promise(resolve => 
    setTimeout(() => resolve([
      { id: '1', name: 'John Doe', email: 'john@email.com', room: '102', checkIn: '2024-01-15', checkOut: '2024-01-18' },
      { id: '2', name: 'Jane Smith', email: 'jane@email.com', room: '105', checkIn: '2024-01-16', checkOut: '2024-01-20' }
    ]), 800)
  ),

  addGuest: (data: any) => new Promise(resolve => 
    setTimeout(() => resolve({ id: Date.now().toString(), ...data }), 600)
  ),

  updateGuest: (id: string, data: any) => new Promise(resolve => 
    setTimeout(() => resolve({ id, ...data }), 600)
  ),

  deleteGuest: (id: string) => new Promise(resolve => 
    setTimeout(() => resolve({ id }), 600)
  ),

  // Smart Locks API
  getSmartLocks: () => new Promise(resolve => 
    setTimeout(() => resolve([
      { id: '1', room: '101', status: 'locked', battery: 85, signal: 'strong', lastHeartbeat: new Date().toISOString() },
      { id: '2', room: '102', status: 'unlocked', battery: 42, signal: 'medium', lastHeartbeat: new Date().toISOString() },
      { id: '3', room: '103', status: 'locked', battery: 15, signal: 'weak', lastHeartbeat: new Date().toISOString() }
    ]), 800)
  ),

  updateLockStatus: (id: string, status: 'locked' | 'unlocked') => new Promise(resolve => 
    setTimeout(() => resolve({ id, status }), 600)
  ),

  // Settings API
  getSettings: () => new Promise(resolve => 
    setTimeout(() => resolve({
      hotelName: 'Grand Hotel',
      hotelAddress: '123 Hotel Street',
      currency: 'USD',
      timezone: 'UTC-5',
      theme: 'light'
    }), 800)
  ),

  updateSettings: (data: any) => new Promise(resolve => 
    setTimeout(() => resolve(data), 600)
  )
};