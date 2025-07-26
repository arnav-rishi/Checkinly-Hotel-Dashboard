
-- Insert sample rooms
INSERT INTO public.rooms (room_number, room_type, floor, capacity, price_per_night, status, amenities, hotel_id, created_by) 
VALUES 
  ('101', 'Standard', 1, 2, 120.00, 'available', '{"WiFi", "TV", "AC"}', get_user_hotel_id(), auth.uid()),
  ('102', 'Deluxe', 1, 3, 180.00, 'occupied', '{"WiFi", "TV", "AC", "Minibar", "Balcony"}', get_user_hotel_id(), auth.uid()),
  ('201', 'Suite', 2, 4, 350.00, 'available', '{"WiFi", "TV", "AC", "Minibar", "Balcony", "Kitchen", "Living Room"}', get_user_hotel_id(), auth.uid()),
  ('202', 'Standard', 2, 2, 120.00, 'cleaning', '{"WiFi", "TV", "AC"}', get_user_hotel_id(), auth.uid()),
  ('301', 'Deluxe', 3, 3, 180.00, 'maintenance', '{"WiFi", "TV", "AC", "Minibar", "Balcony"}', get_user_hotel_id(), auth.uid()),
  ('302', 'Presidential Suite', 3, 6, 500.00, 'available', '{"WiFi", "TV", "AC", "Minibar", "Balcony", "Kitchen", "Living Room", "Hot Tub", "Butler Service"}', get_user_hotel_id(), auth.uid());

-- Insert sample guests
INSERT INTO public.guests (first_name, last_name, email, phone, address, city, country, date_of_birth, id_type, id_number, hotel_id, created_by)
VALUES 
  ('John', 'Smith', 'john.smith@email.com', '+1234567890', '123 Main St', 'New York', 'USA', '1985-03-15', 'Passport', 'P123456789', get_user_hotel_id(), auth.uid()),
  ('Emma', 'Johnson', 'emma.johnson@email.com', '+1987654321', '456 Oak Ave', 'Los Angeles', 'USA', '1990-07-22', 'Driver License', 'DL987654321', get_user_hotel_id(), auth.uid()),
  ('Michael', 'Chen', 'michael.chen@email.com', '+1555666777', '789 Pine Rd', 'San Francisco', 'USA', '1988-11-08', 'Passport', 'P987654321', get_user_hotel_id(), auth.uid()),
  ('Sarah', 'Williams', 'sarah.williams@email.com', '+1444555666', '321 Elm St', 'Chicago', 'USA', '1992-05-12', 'Driver License', 'DL456789123', get_user_hotel_id(), auth.uid()),
  ('David', 'Brown', 'david.brown@email.com', '+1333444555', '654 Maple Ave', 'Boston', 'USA', '1987-09-30', 'Passport', 'P456789123', get_user_hotel_id(), auth.uid());

-- Insert sample bookings (using room and guest IDs from above)
WITH room_guest_data AS (
  SELECT 
    r.id as room_id,
    g.id as guest_id,
    ROW_NUMBER() OVER (ORDER BY r.room_number) as rn
  FROM rooms r, guests g
  WHERE r.created_by = auth.uid() AND g.created_by = auth.uid()
  LIMIT 5
)
INSERT INTO public.bookings (guest_id, room_id, check_in_date, check_out_date, status, total_amount, special_requests, created_by)
SELECT 
  guest_id,
  room_id,
  CASE rn
    WHEN 1 THEN CURRENT_DATE - INTERVAL '2 days'
    WHEN 2 THEN CURRENT_DATE
    WHEN 3 THEN CURRENT_DATE + INTERVAL '1 day'
    WHEN 4 THEN CURRENT_DATE + INTERVAL '3 days'
    WHEN 5 THEN CURRENT_DATE + INTERVAL '7 days'
  END as check_in_date,
  CASE rn
    WHEN 1 THEN CURRENT_DATE + INTERVAL '1 day'
    WHEN 2 THEN CURRENT_DATE + INTERVAL '3 days'
    WHEN 3 THEN CURRENT_DATE + INTERVAL '4 days'
    WHEN 4 THEN CURRENT_DATE + INTERVAL '6 days'
    WHEN 5 THEN CURRENT_DATE + INTERVAL '10 days'
  END as check_out_date,
  CASE rn
    WHEN 1 THEN 'completed'
    WHEN 2 THEN 'confirmed'
    WHEN 3 THEN 'confirmed'
    WHEN 4 THEN 'pending'
    WHEN 5 THEN 'confirmed'
  END as status,
  CASE rn
    WHEN 1 THEN 360.00
    WHEN 2 THEN 540.00
    WHEN 3 THEN 1050.00
    WHEN 4 THEN 240.00
    WHEN 5 THEN 540.00
  END as total_amount,
  CASE rn
    WHEN 1 THEN 'Late check-in requested'
    WHEN 2 THEN 'Extra towels please'
    WHEN 3 THEN 'Quiet room preferred'
    WHEN 4 THEN 'Ground floor if possible'
    WHEN 5 THEN 'Anniversary celebration - champagne would be appreciated'
  END as special_requests,
  auth.uid()
FROM room_guest_data;

-- Insert sample payments for the bookings
WITH booking_data AS (
  SELECT 
    id as booking_id,
    total_amount,
    ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM bookings
  WHERE created_by = auth.uid()
  LIMIT 5
)
INSERT INTO public.payments (booking_id, amount, payment_method, payment_status, transaction_id, paid_at, created_by)
SELECT 
  booking_id,
  total_amount,
  CASE rn
    WHEN 1 THEN 'credit_card'
    WHEN 2 THEN 'debit_card'
    WHEN 3 THEN 'cash'
    WHEN 4 THEN 'credit_card'
    WHEN 5 THEN 'bank_transfer'
  END as payment_method,
  CASE rn
    WHEN 1 THEN 'completed'
    WHEN 2 THEN 'completed'
    WHEN 3 THEN 'completed'
    WHEN 4 THEN 'pending'
    WHEN 5 THEN 'completed'
  END as payment_status,
  CASE rn
    WHEN 1 THEN 'TXN_001_' || EXTRACT(EPOCH FROM NOW())::text
    WHEN 2 THEN 'TXN_002_' || EXTRACT(EPOCH FROM NOW())::text
    WHEN 3 THEN 'CASH_003_' || EXTRACT(EPOCH FROM NOW())::text
    WHEN 4 THEN NULL
    WHEN 5 THEN 'BANK_005_' || EXTRACT(EPOCH FROM NOW())::text
  END as transaction_id,
  CASE rn
    WHEN 1 THEN NOW() - INTERVAL '2 days'
    WHEN 2 THEN NOW() - INTERVAL '1 day'
    WHEN 3 THEN NOW() - INTERVAL '3 hours'
    WHEN 4 THEN NULL
    WHEN 5 THEN NOW() - INTERVAL '5 days'
  END as paid_at,
  auth.uid()
FROM booking_data;

-- Insert sample smart locks
WITH room_data AS (
  SELECT 
    id as room_id,
    room_number,
    ROW_NUMBER() OVER (ORDER BY room_number) as rn
  FROM rooms
  WHERE created_by = auth.uid()
  LIMIT 4
)
INSERT INTO public.smart_locks (lock_id, room_id, status, battery_level, signal_strength, type, last_heartbeat, last_ping, hotel_id, created_by)
SELECT 
  'LOCK_' || room_number as lock_id,
  room_id,
  CASE rn
    WHEN 1 THEN 'locked'
    WHEN 2 THEN 'unlocked'
    WHEN 3 THEN 'locked'
    WHEN 4 THEN 'error'
  END as status,
  CASE rn
    WHEN 1 THEN 85
    WHEN 2 THEN 92
    WHEN 3 THEN 67
    WHEN 4 THEN 23
  END as battery_level,
  CASE rn
    WHEN 1 THEN -45
    WHEN 2 THEN -38
    WHEN 3 THEN -52
    WHEN 4 THEN -67
  END as signal_strength,
  CASE rn
    WHEN 1 THEN 'NFC'
    WHEN 2 THEN 'Passcode'
    WHEN 3 THEN 'NFC'
    WHEN 4 THEN 'Passcode'
  END as type,
  CASE rn
    WHEN 1 THEN NOW() - INTERVAL '2 minutes'
    WHEN 2 THEN NOW() - INTERVAL '1 minute'
    WHEN 3 THEN NOW() - INTERVAL '4 minutes'
    WHEN 4 THEN NOW() - INTERVAL '15 minutes'
  END as last_heartbeat,
  CASE rn
    WHEN 1 THEN NOW() - INTERVAL '1 minute'
    WHEN 2 THEN NOW() - INTERVAL '30 seconds'
    WHEN 3 THEN NOW() - INTERVAL '3 minutes'
    WHEN 4 THEN NOW() - INTERVAL '12 minutes'
  END as last_ping,
  get_user_hotel_id(),
  auth.uid()
FROM room_data;
