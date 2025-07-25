
-- Allow users to insert hotels during setup
CREATE POLICY "Users can create hotels during setup" 
  ON public.hotels 
  FOR INSERT 
  WITH CHECK (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can create their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Update the handle_new_user function to not automatically create a profile
-- since we want users to go through the hotel setup flow
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
