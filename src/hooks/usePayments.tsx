
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
      
      // Type guard function that properly handles optional fields
      const isValidPayment = (payment: any): payment is Payment => {
        return payment && 
               typeof payment.id === 'string' && 
               typeof payment.booking_id === 'string' &&
               typeof payment.amount === 'number' &&
               typeof payment.payment_method === 'string' &&
               typeof payment.payment_status === 'string' &&
               typeof payment.created_at === 'string' &&
               typeof payment.created_by === 'string' &&
               (payment.transaction_id === null || payment.transaction_id === undefined || typeof payment.transaction_id === 'string') &&
               (payment.paid_at === null || payment.paid_at === undefined || typeof payment.paid_at === 'string');
      };
      
      // Filter and validate the data
      const validPayments = (data || []).filter(isValidPayment);
      
      setPayments(validPayments);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payments',
        variant: 'destructive',
      });
      setPayments([]);
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
        .select('*')
        .single();

      if (error) throw error;

      // Validate the returned data
      if (data && 
          typeof data.id === 'string' && 
          typeof data.booking_id === 'string' &&
          typeof data.amount === 'number' &&
          typeof data.payment_method === 'string' &&
          typeof data.payment_status === 'string' &&
          typeof data.created_at === 'string' &&
          typeof data.created_by === 'string') {
        
        const newPayment: Payment = {
          id: data.id,
          booking_id: data.booking_id,
          amount: data.amount,
          payment_method: data.payment_method,
          payment_status: data.payment_status,
          created_at: data.created_at,
          created_by: data.created_by,
          transaction_id: data.transaction_id || undefined,
          paid_at: data.paid_at || undefined,
        };
        
        setPayments(prev => [newPayment, ...prev]);
        toast({
          title: 'Success',
          description: 'Payment created successfully',
        });
        return newPayment;
      } else {
        throw new Error('Invalid payment data returned');
      }
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
        .select('*')
        .single();

      if (error) throw error;

      // Validate the returned data
      if (data && 
          typeof data.id === 'string' && 
          typeof data.booking_id === 'string' &&
          typeof data.amount === 'number' &&
          typeof data.payment_method === 'string' &&
          typeof data.payment_status === 'string' &&
          typeof data.created_at === 'string' &&
          typeof data.created_by === 'string') {
        
        const updatedPayment: Payment = {
          id: data.id,
          booking_id: data.booking_id,
          amount: data.amount,
          payment_method: data.payment_method,
          payment_status: data.payment_status,
          created_at: data.created_at,
          created_by: data.created_by,
          transaction_id: data.transaction_id || undefined,
          paid_at: data.paid_at || undefined,
        };
        
        setPayments(prev => prev.map(payment => 
          payment.id === id ? updatedPayment : payment
        ));
        
        toast({
          title: 'Success',
          description: 'Payment updated successfully',
        });
        return updatedPayment;
      } else {
        throw new Error('Invalid payment data returned');
      }
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
