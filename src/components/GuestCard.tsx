
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Calendar, Eye, CheckCircle } from 'lucide-react';

interface GuestCardProps {
  name: string;
  guestId: string;
  email: string;
  phone: string;
  room: string;
  dates: string;
  status: string;
  statusColor: string;
  verified: boolean;
}

export const GuestCard: React.FC<GuestCardProps> = ({
  name,
  guestId,
  email,
  phone,
  room,
  dates,
  status,
  statusColor,
  verified
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const getStatusAction = () => {
    switch (status) {
      case 'Checked In':
        return { text: 'View', variant: 'outline' as const };
      case 'Reserved':
        return { text: 'View', variant: 'outline' as const };
      case 'Checked Out':
        return { text: 'View', variant: 'outline' as const };
      default:
        return { text: 'View', variant: 'outline' as const };
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">{getInitials(name)}</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{name}</h3>
              <p className="text-sm text-gray-500">{guestId}</p>
            </div>
          </div>
          {verified && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{phone}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>Room {room}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{dates}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge className={statusColor}>
            {status}
          </Badge>
          <div className="flex gap-2">
            <Button
              variant={getStatusAction().variant}
              size="sm"
              className="text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              {getStatusAction().text}
            </Button>
            {verified && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                Verified
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
