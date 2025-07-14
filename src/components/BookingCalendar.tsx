
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApi } from '@/hooks/useApi';
import { supabase } from '@/integrations/supabase/client';
import { format, isSameDay, parseISO } from 'date-fns';

interface Booking {
  id: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  room_id: string;
  guest_id: string;
  guests?: {
    first_name: string;
    last_name: string;
  };
  rooms?: {
    room_number: string;
  };
}

export const BookingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { execute: fetchBookings, loading } = useApi();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const result = await fetchBookings(async () => {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            guests (first_name, last_name),
            rooms (room_number)
          `);
        if (error) throw error;
        return data;
      });

      if (result) {
        setBookings(result);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const checkIn = parseISO(booking.check_in_date);
      const checkOut = parseISO(booking.check_out_date);
      return date >= checkIn && date <= checkOut;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'checked_in': return 'bg-blue-500';
      case 'checked_out': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const selectedDateBookings = getBookingsForDate(selectedDate);

  const modifiers = {
    booked: (date: Date) => getBookingsForDate(date).length > 0,
  };

  const modifiersStyles = {
    booked: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      borderRadius: '6px',
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Bookings for {format(selectedDate, 'MMMM dd, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          ) : selectedDateBookings.length > 0 ? (
            <div className="space-y-4">
              {selectedDateBookings.map(booking => (
                <div key={booking.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">
                        {booking.guests?.first_name} {booking.guests?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Room {booking.rooms?.room_number}
                      </p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(parseISO(booking.check_in_date), 'MMM dd')} - {format(parseISO(booking.check_out_date), 'MMM dd')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No bookings for this date</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
