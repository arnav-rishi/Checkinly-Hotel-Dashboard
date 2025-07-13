-- Enable Row Level Security on auth.users is already enabled by Supabase
-- Let's add proper RLS policies for authenticated users only

-- Update RLS policies to be more specific for authenticated users
DROP POLICY IF EXISTS "Authenticated users can access rooms" ON public.rooms;
CREATE POLICY "Authenticated users can access rooms" ON public.rooms
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can access guests" ON public.guests;
CREATE POLICY "Authenticated users can access guests" ON public.guests
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can access bookings" ON public.bookings;
CREATE POLICY "Authenticated users can access bookings" ON public.bookings
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can access payments" ON public.payments;
CREATE POLICY "Authenticated users can access payments" ON public.payments
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can access smart_locks" ON public.smart_locks;
CREATE POLICY "Authenticated users can access smart_locks" ON public.smart_locks
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);