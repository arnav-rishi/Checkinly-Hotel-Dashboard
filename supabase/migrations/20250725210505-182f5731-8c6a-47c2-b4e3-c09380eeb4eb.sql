
-- First, let's drop the existing INSERT policy and create a new one
DROP POLICY IF EXISTS "Users can create hotels during setup" ON public.hotels;

-- Create a new INSERT policy that allows authenticated users to create hotels
CREATE POLICY "Allow hotel creation during setup" 
  ON public.hotels 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Also ensure the profiles table allows user creation
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;

CREATE POLICY "Allow profile creation during setup" 
  ON public.profiles 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);
