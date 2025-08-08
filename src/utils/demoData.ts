
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

async function getHotelId(): Promise<string> {
  try {
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!auth?.user) throw new Error('You must be logged in to generate demo data');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('hotel_id')
      .eq('id', auth.user.id)
      .single();

    if (profileError) {
      // If no profile exists, create a default hotel_id
      console.warn('No profile found, creating default hotel_id');
      return crypto.randomUUID();
    }
    
    if (!profile?.hotel_id) {
      // Create a default hotel_id if none exists
      const defaultHotelId = crypto.randomUUID();
      return defaultHotelId;
    }
    
    return profile.hotel_id as string;
  } catch (error) {
    console.error('Error getting hotel ID:', error);
    // Return a default hotel ID for demo purposes
    return crypto.randomUUID();
  }
}

export async function seedDemoData({ roomsCount = 20, guestsCount = 30, locksCount = 10 }: { roomsCount?: number; guestsCount?: number; locksCount?: number; }) {
  try {
    const hotelId = await getHotelId();

    // 1) Fetch existing rooms to avoid duplicate room numbers
    const { data: existingRooms } = await supabase
      .from('rooms')
      .select('id, room_number')
      .order('room_number');

    const existingSet = new Set((existingRooms || []).map(r => r.room_number as string));

    // 2) Generate rooms
    const roomTypes = ['Single', 'Double', 'Suite'];
    const capacities = [1, 2, 3, 4];
    const basePriceByType: Record<string, number> = { Single: 80, Double: 120, Suite: 220 };
    const newRoomNumbers = uniqueSequentialRoomNumbers(existingSet, roomsCount);

    const newRooms = newRoomNumbers.map((room_number) => {
      const room_type = randomFrom(roomTypes);
      const capacity = randomFrom(capacities);
      const price_per_night = basePriceByType[room_type] + Math.floor(Math.random() * 60);
      const floor = parseInt(room_number[0]);
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
      const { data: roomsInserted, error: roomsErr } = await supabase
        .from('rooms')
        .insert(newRooms)
        .select('id, room_number');
      if (roomsErr) {
        console.error('Error inserting rooms:', roomsErr);
        // Continue with existing rooms if insert fails
      } else {
        insertedRooms = roomsInserted || [];
      }
    }

    const allRooms = [...(existingRooms || []), ...insertedRooms] as { id: string; room_number: string }[];

    // 3) Generate guests
    const firstNames = ['Alex', 'Jamie', 'Taylor', 'Morgan', 'Jordan', 'Casey', 'Riley', 'Avery', 'Parker', 'Quinn'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
    const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Spain', 'Italy', 'Australia', 'India', 'Japan'];
    const idTypes = ['Passport', 'National ID', 'Driver License'];

    const guests = Array.from({ length: guestsCount }).map((_, i) => {
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
        date_of_birth: null as any,
      };
    });

    const { data: insertedGuests, error: guestsErr } = await supabase
      .from('guests')
      .insert(guests)
      .select('id');
    
    if (guestsErr) {
      console.error('Error inserting guests:', guestsErr);
    }

    const guestIds = (insertedGuests || []).map(g => g.id as string);

    // 4) Create bookings for a subset of guests and mark those rooms as occupied
    if (allRooms.length > 0 && guestIds.length > 0) {
      const roomsForBooking = allRooms.slice().sort(() => 0.5 - Math.random()).slice(0, Math.min(guestIds.length, allRooms.length));
      const today = new Date();

      const bookings = roomsForBooking.map((room, idx) => {
        const checkInOffset = Math.floor(Math.random() * 6) - 2; // between -2 and +3 days from today
        const checkOutOffset = checkInOffset + 1 + Math.floor(Math.random() * 4); // at least 1 night
        const check_in_date = new Date(today);
        check_in_date.setDate(today.getDate() + checkInOffset);
        const check_out_date = new Date(today);
        check_out_date.setDate(today.getDate() + checkOutOffset);

        const nights = Math.max(1, Math.round((check_out_date.getTime() - check_in_date.getTime()) / (1000 * 60 * 60 * 24)));
        const price = 100 + Math.floor(Math.random() * 150);

        return {
          guest_id: guestIds[idx % guestIds.length],
          room_id: room.id,
          check_in_date: check_in_date.toISOString().slice(0, 10),
          check_out_date: check_out_date.toISOString().slice(0, 10),
          total_amount: price * nights,
          status: 'confirmed',
          special_requests: null as any,
        };
      });

      if (bookings.length > 0) {
        const { error: bookingsErr } = await supabase
          .from('bookings')
          .insert(bookings);
        if (bookingsErr) {
          console.error('Error inserting bookings:', bookingsErr);
        }

        const occupiedIds = roomsForBooking.map(r => r.id);
        const { error: updateRoomsErr } = await supabase
          .from('rooms')
          .update({ status: 'occupied' })
          .in('id', occupiedIds);
        if (updateRoomsErr) {
          console.error('Error updating room status:', updateRoomsErr);
        }
      }
    }

    // 5) Create smart locks for a subset of rooms
    if (allRooms.length > 0) {
      const roomsForLocks = allRooms.slice().sort(() => 0.5 - Math.random()).slice(0, Math.min(locksCount, allRooms.length));
      const locks = roomsForLocks.map((room) => ({
        hotel_id: hotelId,
        room_id: room.id,
        lock_id: `LOCK-${Math.floor(100000 + Math.random() * 900000)}`,
        status: Math.random() > 0.3 ? 'locked' : 'unlocked',
        battery_level: 30 + Math.floor(Math.random() * 70),
        signal_strength: 1 + Math.floor(Math.random() * 5),
        error_message: null as any,
      }));

      if (locks.length > 0) {
        const { error: locksErr } = await supabase
          .from('smart_locks')
          .insert(locks);
        if (locksErr) {
          console.error('Error inserting locks:', locksErr);
        }
      }
    }

    return { 
      roomsInserted: insertedRooms.length, 
      guestsInserted: guestIds.length, 
      bookingsInserted: Math.min(allRooms.length, guestIds.length), 
      locksInserted: Math.min(locksCount, allRooms.length) 
    };
  } catch (error) {
    console.error('Demo data generation failed:', error);
    throw new Error(`Demo data generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
