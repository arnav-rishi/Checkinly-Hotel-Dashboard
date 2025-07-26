
-- Add created_by column to hotels table with default value
ALTER TABLE public.hotels ADD COLUMN created_by UUID DEFAULT auth.uid();

-- Update the created_by column for existing records (if any)
UPDATE public.hotels SET created_by = auth.uid() WHERE created_by IS NULL;

-- Make created_by column not nullable
ALTER TABLE public.hotels ALTER COLUMN created_by SET NOT NULL;

-- Drop the existing INSERT policy and create a new one
DROP POLICY IF EXISTS "Allow hotel creation during setup" ON public.hotels;

-- Create a new INSERT policy that allows authenticated users to create hotels only if created_by matches their UID
CREATE POLICY "Users can create hotels with their UID" 
  ON public.hotels 
  FOR INSERT 
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Update the SELECT policy to also check created_by
DROP POLICY IF EXISTS "Users can view their own hotel" ON public.hotels;

CREATE POLICY "Users can view their own hotel" 
  ON public.hotels 
  FOR SELECT 
  TO authenticated
  USING (created_by = auth.uid() OR id = get_user_hotel_id());

-- Update the UPDATE policy to also check created_by
DROP POLICY IF EXISTS "Users can update their own hotel" ON public.hotels;

CREATE POLICY "Users can update their own hotel" 
  ON public.hotels 
  FOR UPDATE 
  TO authenticated
  USING (created_by = auth.uid() OR id = get_user_hotel_id())
  WITH CHECK (created_by = auth.uid() OR id = get_user_hotel_id());
