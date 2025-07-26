
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  transaction_id?: string;
  created_at: string;
  paid_at?: string;
  created_by: string;
}

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (paymentData: Omit<Payment, 'id' | 'created_at' | 'created_by'>) => {
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([paymentData])
        .select()
        .single();

      if (error) throw error;

      setPayments(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Payment created successfully',
      });
      return data;
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to create payment',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const updatePayment = async (id: string, updates: Partial<Payment>) => {
    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPayments(prev => prev.map(payment => 
        payment.id === id ? { ...payment, ...data } : payment
      ));
      
      toast({
        title: 'Success',
        description: 'Payment updated successfully',
      });
      return data;
    } catch (error: any) {
      console.error('Error updating payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update payment',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const deletePayment = async (id: string) => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPayments(prev => prev.filter(payment => payment.id !== id));
      toast({
        title: 'Success',
        description: 'Payment deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete payment',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return {
    payments,
    loading,
    creating,
    updating,
    deleting,
    fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
  };
};
