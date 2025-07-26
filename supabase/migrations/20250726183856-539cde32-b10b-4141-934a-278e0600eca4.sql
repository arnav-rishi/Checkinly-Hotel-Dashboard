
-- Add created_by column to payments table
ALTER TABLE public.payments 
ADD COLUMN created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Update existing records to have created_by set to a default value
-- Since we can't know who created existing payments, we'll need to handle this
-- For now, we'll leave existing records with NULL and let the RLS handle it

-- Drop the existing RLS policy
DROP POLICY IF EXISTS "Users can access their hotel's payments" ON public.payments;

-- Create new RLS policy that allows users to access payments they created
CREATE POLICY "Users can access their own payments" 
ON public.payments 
FOR ALL 
USING (created_by = auth.uid());

-- Also allow users to access payments for bookings in their hotel
CREATE POLICY "Users can access their hotel's payments via bookings" 
ON public.payments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1
    FROM bookings
    JOIN rooms ON rooms.id = bookings.room_id
    WHERE bookings.id = payments.booking_id 
    AND rooms.hotel_id = get_user_hotel_id()
  )
);
