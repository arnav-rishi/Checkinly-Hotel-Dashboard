
import { supabase } from '@/integrations/supabase/client';

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uniqueSequentialRoomNumbers(existing: Set<string>, count: number) {
  const nums: string[] = [];
  let floor = 1;
  let number = 1;
  while (nums.length < count && floor <= 20) {
    const roomNumber = `${floor}${number.toString().padStart(2, '0')}`; // e.g., 101, 102
    if (!existing.has(roomNumber)) {
      nums.push(roomNumber);
      existing.add(roomNumber);
    }
    number += 1;
    if (number > 20) {
      number = 1;
      floor += 1;
    }
  }
  return nums;
}

async function ensureUserProfileAndHotelId(): Promise<string> {
  try {
    console.log('Getting authenticated user...');
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!auth?.user) throw new Error('You must be logged in to generate demo data');

    console.log('User authenticated:', auth.user.id);

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('hotel_id')
      .eq('id', auth.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile error:', profileError);
      throw profileError;
    }

    let hotelId: string;

    if (!profile || !profile.hotel_id) {
      console.log('No profile or hotel_id found, creating new hotel and profile...');
      
      // Create a new hotel first
      const newHotelId = crypto.randomUUID();
      const { data: hotelData, error: hotelError } = await supabase
        .from('hotels')
        .insert([{
          id: newHotelId,
          name: 'Demo Hotel',
          address: '123 Demo Street, Demo City, Demo State 12345',
          phone: '+1 (555) 123-4567',
          email: 'demo@hotel.com',
          timezone: 'UTC-5 (Eastern)'
        }])
        .select()
        .single();

      if (hotelError) {
        console.error('Hotel creation error:', hotelError);
        throw hotelError;
      }

      console.log('Hotel created:', hotelData.id);

      // Create or update profile with hotel_id
      const { error: profileUpsertError } = await supabase
        .from('profiles')
        .upsert([{
          id: auth.user.id,
          hotel_id: hotelData.id,
          first_name: 'Demo',
          last_name: 'User',
          role: 'admin'
        }])
        .select();

      if (profileUpsertError) {
        console.error('Profile upsert error:', profileUpsertError);
        throw profileUpsertError;
      }

      console.log('Profile created/updated with hotel_id:', hotelData.id);
      hotelId = hotelData.id;
    } else {
      console.log('Using existing hotel_id:', profile.hotel_id);
      hotelId = profile.hotel_id;
    }

    return hotelId;
  } catch (error) {
    console.error('Error in ensureUserProfileAndHotelId:', error);
    throw error;
  }
}

export async function seedDemoData({ 
  roomsCount = 20, 
  guestsCount = 30, 
  locksCount = 10 
}: { 
  roomsCount?: number; 
  guestsCount?: number; 
  locksCount?: number; 
}) {
  try {
    console.log('Starting demo data generation...');
    const hotelId = await ensureUserProfileAndHotelId();

    console.log('Hotel ID obtained:', hotelId);

    // 1) Generate rooms first
    console.log('Fetching existing rooms...');
    const { data: existingRooms } = await supabase
      .from('rooms')
      .select('id, room_number')
      .eq('hotel_id', hotelId)
      .order('room_number');

    const hotelSuffix = `-${hotelId.slice(0, 4)}`;
    // Build a set of existing base room numbers (strip any previously appended suffix)
    const existingBaseSet = new Set((existingRooms || []).map(r => r.room_number.split('-')[0]));
    console.log('Existing rooms count:', existingBaseSet.size);

    const roomTypes = ['Single', 'Double', 'Suite'];
    const capacities = [1, 2, 3, 4];
    const basePriceByType: Record<string, number> = { Single: 80, Double: 120, Suite: 220 };
    const newBaseRoomNumbers = uniqueSequentialRoomNumbers(existingBaseSet, roomsCount);
    const finalRoomNumbers = newBaseRoomNumbers.map(n => `${n}${hotelSuffix}`);

    console.log('Generating', finalRoomNumbers.length, 'new rooms...');

    const newRooms = finalRoomNumbers.map((room_number) => {
      const room_type = randomFrom(roomTypes);
      const capacity = randomFrom(capacities);
      const price_per_night = basePriceByType[room_type] + Math.floor(Math.random() * 60);
      const numericPart = room_number.split('-')[0];
      const floor = parseInt(numericPart[0]);
      return {
        hotel_id: hotelId,
        room_number,
        room_type,
        capacity,
        floor,
        price_per_night,
        status: 'available' as const,
        amenities: ['WiFi', 'TV', 'AC'].slice(0, 1 + Math.floor(Math.random() * 3)),
      };
    });

    let insertedRooms: { id: string; room_number: string }[] = [];
    if (newRooms.length > 0) {
      console.log('Inserting rooms...');
      const { data: roomsInserted, error: roomsErr } = await supabase
        .from('rooms')
        .insert(newRooms)
        .select('id, room_number');
      
      if (roomsErr) {
        console.error('Error inserting rooms:', roomsErr);
        throw roomsErr;
      } else {
        insertedRooms = roomsInserted || [];
        console.log('Rooms inserted successfully:', insertedRooms.length);
      }
    }

    const allRooms = [...(existingRooms || []), ...insertedRooms];
    console.log('Total rooms available:', allRooms.length);

    // 2) Generate guests
    console.log('Generating guests...');
    const firstNames = ['Alex', 'Jamie', 'Taylor', 'Morgan', 'Jordan', 'Casey', 'Riley', 'Avery', 'Parker', 'Quinn'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
    const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Spain', 'Italy', 'Australia', 'India', 'Japan'];
    const idTypes = ['Passport', 'National ID', 'Driver License'];

    const guests = Array.from({ length: guestsCount }).map(() => {
      const first = randomFrom(firstNames);
      const last = randomFrom(lastNames);
      const email = `${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(Math.random() * 1000)}@example.com`;
      const phone = `+1-555-${Math.floor(1000000 + Math.random() * 9000000)}`;
      return {
        hotel_id: hotelId,
        first_name: first,
        last_name: last,
        email,
        phone,
        id_type: randomFrom(idTypes),
        id_number: `${Math.floor(100000000 + Math.random() * 900000000)}`,
        address: `${Math.floor(100 + Math.random() * 900)} Main St`,
        city: 'Metropolis',
        country: randomFrom(countries),
        date_of_birth: null,
      };
    });

    console.log('Inserting guests...');
    const { data: insertedGuests, error: guestsErr } = await supabase
      .from('guests')
      .insert(guests)
      .select('id');
    
    if (guestsErr) {
      console.error('Error inserting guests:', guestsErr);
      throw guestsErr;
    }

    const guestIds = (insertedGuests || []).map(g => g.id);
    console.log('Guests inserted successfully:', guestIds.length);

    // 3) Create bookings and payments
    let bookingsCreated = 0;
    let paymentsCreated = 0;

    if (allRooms.length > 0 && guestIds.length > 0) {
      console.log('Creating bookings and payments...');
      const roomsForBooking = allRooms.slice().sort(() => 0.5 - Math.random()).slice(0, Math.min(guestIds.length, allRooms.length));
      const today = new Date();

      for (let i = 0; i < roomsForBooking.length; i++) {
        const room = roomsForBooking[i];
        const guestId = guestIds[i % guestIds.length];

        const checkInOffset = Math.floor(Math.random() * 6) - 2; // between -2 and +3 days from today
        const checkOutOffset = checkInOffset + 1 + Math.floor(Math.random() * 4); // at least 1 night
        const check_in_date = new Date(today);
        check_in_date.setDate(today.getDate() + checkInOffset);
        const check_out_date = new Date(today);
        check_out_date.setDate(today.getDate() + checkOutOffset);

        const nights = Math.max(1, Math.round((check_out_date.getTime() - check_in_date.getTime()) / (1000 * 60 * 60 * 24)));
        const price = 100 + Math.floor(Math.random() * 150);
        const totalAmount = price * nights;

        try {
          // Create booking
          const { data: bookingData, error: bookingError } = await supabase
            .from('bookings')
            .insert([{
              guest_id: guestId,
              room_id: room.id,
              check_in_date: check_in_date.toISOString().slice(0, 10),
              check_out_date: check_out_date.toISOString().slice(0, 10),
              total_amount: totalAmount,
              status: 'confirmed',
              special_requests: null,
            }])
            .select('id')
            .single();

          if (bookingError) {
            console.error('Error creating booking:', bookingError);
            continue;
          }

          bookingsCreated++;
          console.log(`Booking created: ${bookingsCreated}`);

          // Create payment for this booking
          const paymentMethods = ['credit_card', 'debit_card', 'cash', 'bank_transfer'];
          const paymentStatuses = ['completed', 'pending', 'failed'];
          const paymentStatus = randomFrom(paymentStatuses);
          
          const { error: paymentError } = await supabase
            .from('payments')
            .insert([{
              booking_id: bookingData.id,
              amount: totalAmount,
              payment_method: randomFrom(paymentMethods),
              payment_status: paymentStatus,
              transaction_id: paymentStatus === 'completed' ? `TXN-${Math.floor(100000 + Math.random() * 900000)}` : null,
              paid_at: paymentStatus === 'completed' ? new Date().toISOString() : null,
            }]);

          if (paymentError) {
            console.error('Error creating payment:', paymentError);
          } else {
            paymentsCreated++;
            console.log(`Payment created: ${paymentsCreated}`);
          }

          // Update room status to occupied if check-in is today or in the past
          if (checkInOffset <= 0) {
            await supabase
              .from('rooms')
              .update({ status: 'occupied' })
              .eq('id', room.id);
          }

        } catch (error) {
          console.error('Error in booking/payment creation loop:', error);
          continue;
        }
      }
    }

    // 4) Create smart locks
    let locksCreated = 0;
    if (allRooms.length > 0) {
      console.log('Creating smart locks...');
      const roomsForLocks = allRooms.slice().sort(() => 0.5 - Math.random()).slice(0, Math.min(locksCount, allRooms.length));
      
      for (const room of roomsForLocks) {
        try {
          const { error: lockError } = await supabase
            .from('smart_locks')
            .insert([{
              hotel_id: hotelId,
              room_id: room.id,
              lock_id: `LOCK-${Math.floor(100000 + Math.random() * 900000)}-${hotelId.slice(0, 4)}`,
              status: Math.random() > 0.3 ? 'locked' : 'unlocked',
              battery_level: 30 + Math.floor(Math.random() * 70),
              signal_strength: 1 + Math.floor(Math.random() * 5),
              error_message: null,
            }]);

          if (lockError) {
            console.error('Error creating smart lock:', lockError);
          } else {
            locksCreated++;
            console.log(`Smart lock created: ${locksCreated}`);
          }
        } catch (error) {
          console.error('Error in smart lock creation:', error);
          continue;
        }
      }
    }

    console.log('Demo data generation completed successfully!');
    console.log(`Summary:
      - Rooms: ${insertedRooms.length} inserted
      - Guests: ${guestIds.length} inserted  
      - Bookings: ${bookingsCreated} created
      - Payments: ${paymentsCreated} created
      - Smart Locks: ${locksCreated} created`);

    return { 
      roomsInserted: insertedRooms.length, 
      guestsInserted: guestIds.length, 
      bookingsInserted: bookingsCreated, 
      paymentsInserted: paymentsCreated,
      locksInserted: locksCreated 
    };
  } catch (error) {
    console.error('Demo data generation failed:', error);
    throw new Error(`Demo data generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
