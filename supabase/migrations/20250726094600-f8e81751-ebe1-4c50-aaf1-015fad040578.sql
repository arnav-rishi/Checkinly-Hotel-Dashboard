
-- First, let's ensure all tables have proper created_by fields and RLS policies

-- Update rooms table to have created_by field
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS created_by UUID DEFAULT auth.uid();
UPDATE public.rooms SET created_by = auth.uid() WHERE created_by IS NULL;
ALTER TABLE public.rooms ALTER COLUMN created_by SET NOT NULL;

-- Update guests table to have created_by field
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS created_by UUID DEFAULT auth.uid();
UPDATE public.guests SET created_by = auth.uid() WHERE created_by IS NULL;
ALTER TABLE public.guests ALTER COLUMN created_by SET NOT NULL;

-- Update bookings table to have created_by field
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS created_by UUID DEFAULT auth.uid();
UPDATE public.bookings SET created_by = auth.uid() WHERE created_by IS NULL;
ALTER TABLE public.bookings ALTER COLUMN created_by SET NOT NULL;

-- Update payments table to have created_by field
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS created_by UUID DEFAULT auth.uid();
UPDATE public.payments SET created_by = auth.uid() WHERE created_by IS NULL;
ALTER TABLE public.payments ALTER COLUMN created_by SET NOT NULL;

-- Update smart_locks table to have created_by field
ALTER TABLE public.smart_locks ADD COLUMN IF NOT EXISTS created_by UUID DEFAULT auth.uid();
UPDATE public.smart_locks SET created_by = auth.uid() WHERE created_by IS NULL;
ALTER TABLE public.smart_locks ALTER COLUMN created_by SET NOT NULL;

-- Add type and last_ping fields to smart_locks table
ALTER TABLE public.smart_locks ADD COLUMN IF NOT EXISTS type character varying DEFAULT 'NFC';
ALTER TABLE public.smart_locks ADD COLUMN IF NOT EXISTS last_ping timestamp with time zone DEFAULT now();

-- Update RLS policies for all tables to use created_by instead of complex joins

-- Drop existing policies and create new ones for rooms
DROP POLICY IF EXISTS "Users can access their hotel's rooms" ON public.rooms;
CREATE POLICY "Users can access their own rooms" 
  ON public.rooms 
  FOR ALL 
  TO authenticated
  USING (created_by = auth.uid());

-- Drop existing policies and create new ones for guests
DROP POLICY IF EXISTS "Users can access their hotel's guests" ON public.guests;
CREATE POLICY "Users can access their own guests" 
  ON public.guests 
  FOR ALL 
  TO authenticated
  USING (created_by = auth.uid());

-- Drop existing policies and create new ones for bookings
DROP POLICY IF EXISTS "Users can access their hotel's bookings" ON public.bookings;
CREATE POLICY "Users can access their own bookings" 
  ON public.bookings 
  FOR ALL 
  TO authenticated
  USING (created_by = auth.uid());

-- Drop existing policies and create new ones for payments
DROP POLICY IF EXISTS "Users can access their hotel's payments" ON public.payments;
CREATE POLICY "Users can access their own payments" 
  ON public.payments 
  FOR ALL 
  TO authenticated
  USING (created_by = auth.uid());

-- Drop existing policies and create new ones for smart_locks
DROP POLICY IF EXISTS "Users can access their hotel's smart_locks" ON public.smart_locks;
CREATE POLICY "Users can access their own smart_locks" 
  ON public.smart_locks 
  FOR ALL 
  TO authenticated
  USING (created_by = auth.uid());
