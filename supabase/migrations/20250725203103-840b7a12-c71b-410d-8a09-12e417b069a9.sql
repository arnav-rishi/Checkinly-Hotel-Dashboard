
-- Create hotels table
CREATE TABLE public.hotels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table to link users to hotels
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add hotel_id to existing tables for multi-tenancy
ALTER TABLE public.rooms ADD COLUMN hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE;
ALTER TABLE public.guests ADD COLUMN hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE;
ALTER TABLE public.smart_locks ADD COLUMN hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE;

-- Update existing tables to make hotel_id NOT NULL (after data migration)
-- Note: You'll need to populate these with actual hotel data first
-- ALTER TABLE public.rooms ALTER COLUMN hotel_id SET NOT NULL;
-- ALTER TABLE public.guests ALTER COLUMN hotel_id SET NOT NULL;
-- ALTER TABLE public.smart_locks ALTER COLUMN hotel_id SET NOT NULL;

-- Enable RLS on new tables
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user's hotel_id
CREATE OR REPLACE FUNCTION public.get_user_hotel_id()
RETURNS UUID AS $$
  SELECT hotel_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS policies for hotels table
CREATE POLICY "Users can view their own hotel" 
  ON public.hotels 
  FOR SELECT 
  USING (id = public.get_user_hotel_id());

CREATE POLICY "Users can update their own hotel" 
  ON public.hotels 
  FOR UPDATE 
  USING (id = public.get_user_hotel_id());

-- RLS policies for profiles table
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (id = auth.uid());

-- Update RLS policies for existing tables to include hotel_id filtering
DROP POLICY IF EXISTS "Authenticated users can access rooms" ON public.rooms;
CREATE POLICY "Users can access their hotel's rooms" 
  ON public.rooms 
  FOR ALL 
  USING (hotel_id = public.get_user_hotel_id());

DROP POLICY IF EXISTS "Authenticated users can access guests" ON public.guests;
CREATE POLICY "Users can access their hotel's guests" 
  ON public.guests 
  FOR ALL 
  USING (hotel_id = public.get_user_hotel_id());

DROP POLICY IF EXISTS "Authenticated users can access smart_locks" ON public.smart_locks;
CREATE POLICY "Users can access their hotel's smart_locks" 
  ON public.smart_locks 
  FOR ALL 
  USING (hotel_id = public.get_user_hotel_id());

-- Update bookings and payments to be hotel-specific through room relationship
DROP POLICY IF EXISTS "Authenticated users can access bookings" ON public.bookings;
CREATE POLICY "Users can access their hotel's bookings" 
  ON public.bookings 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms 
      WHERE rooms.id = bookings.room_id 
      AND rooms.hotel_id = public.get_user_hotel_id()
    )
  );

DROP POLICY IF EXISTS "Authenticated users can access payments" ON public.payments;
CREATE POLICY "Users can access their hotel's payments" 
  ON public.payments 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings 
      JOIN public.rooms ON rooms.id = bookings.room_id
      WHERE bookings.id = payments.booking_id 
      AND rooms.hotel_id = public.get_user_hotel_id()
    )
  );

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- This will need to be customized based on how you want to assign hotels
  -- For now, this is a placeholder that would need hotel assignment logic
  INSERT INTO public.profiles (id, hotel_id, first_name, last_name)
  VALUES (
    NEW.id,
    -- You'll need to determine how to assign hotel_id during signup
    -- This could be from metadata, subdomain, or invitation system
    (NEW.raw_user_meta_data->>'hotel_id')::UUID,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger for hotels
CREATE TRIGGER update_hotels_updated_at
  BEFORE UPDATE ON public.hotels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
