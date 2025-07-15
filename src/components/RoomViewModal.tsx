
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, MapPin, Bed, Wifi, Tv, Wind } from 'lucide-react';

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  status: string;
  price_per_night: number;
  capacity: number;
  floor: number;
  amenities?: string[];
  created_at: string;
  updated_at: string;
}

interface RoomViewModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RoomViewModal: React.FC<RoomViewModalProps> = ({ room, isOpen, onClose }) => {
  if (!room) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      case 'cleaning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="w-4 h-4" />;
      case 'tv':
        return <Tv className="w-4 h-4" />;
      case 'ac':
        return <Wind className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Room {room.room_number}</span>
            <Badge className={getStatusColor(room.status)}>
              {room.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Room Type</h4>
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="capitalize">{room.room_type}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Price per Night</h4>
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>${room.price_per_night}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Capacity</h4>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>{room.capacity} guests</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Floor</h4>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Floor {room.floor}</span>
              </div>
            </div>
          </div>

          {room.amenities && room.amenities.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {room.amenities.map((amenity, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {getAmenityIcon(amenity)}
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Created:</span>
              <div>{new Date(room.created_at).toLocaleDateString()}</div>
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>
              <div>{new Date(room.updated_at).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
