
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface UIActionOptions {
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useUIActions = () => {
  const { toast } = useToast();

  const executeAction = useCallback(async (
    action: () => Promise<any>,
    options: UIActionOptions = {}
  ) => {
    const {
      successMessage = 'Action completed successfully',
      errorMessage = 'An error occurred',
      showToast = true,
      onSuccess,
      onError
    } = options;

    try {
      const result = await action();
      
      if (showToast) {
        toast({
          title: 'Success',
          description: successMessage,
        });
      }
      
      onSuccess?.();
      return result;
    } catch (error) {
      console.error('Action failed:', error);
      
      if (showToast) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      
      onError?.(error);
      throw error;
    }
  }, [toast]);

  const confirmAction = useCallback((
    message: string,
    onConfirm: () => void
  ) => {
    if (window.confirm(message)) {
      onConfirm();
    }
  }, []);

  return {
    executeAction,
    confirmAction
  };
};
