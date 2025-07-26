
-- Drop existing RLS policies for guests table
DROP POLICY IF EXISTS "Users can access their hotel's guests" ON public.guests;

-- Create separate, more specific RLS policies for guests table
CREATE POLICY "Users can view their hotel's guests"
  ON public.guests
  FOR SELECT
  USING (hotel_id = get_user_hotel_id());

CREATE POLICY "Users can insert guests for their hotel"
  ON public.guests
  FOR INSERT
  WITH CHECK (hotel_id = get_user_hotel_id());

CREATE POLICY "Users can update their hotel's guests"
  ON public.guests
  FOR UPDATE
  USING (hotel_id = get_user_hotel_id())
  WITH CHECK (hotel_id = get_user_hotel_id());

CREATE POLICY "Users can delete their hotel's guests"
  ON public.guests
  FOR DELETE
  USING (hotel_id = get_user_hotel_id());
