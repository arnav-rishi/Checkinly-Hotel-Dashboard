
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useRooms } from '@/hooks/useRooms';
import { Loader2 } from 'lucide-react';

interface RoomAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const availableAmenities = [
  'WiFi', 'TV', 'AC', 'Mini Bar', 'Safe', 'Balcony', 
  'Kitchen', 'Spa', 'Room Service', 'Laundry', 'Parking', 'Gym Access'
];

const roomTypes = [
  { value: 'single', label: 'Single Room' },
  { value: 'double', label: 'Double Room' },
  { value: 'suite', label: 'Suite' },
  { value: 'deluxe', label: 'Deluxe Room' },
  { value: 'presidential', label: 'Presidential Suite' }
];

export const RoomAddModal: React.FC<RoomAddModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    room_number: '',
    room_type: '',
    floor: 1,
    capacity: 1,
    price_per_night: 0,
    amenities: [] as string[],
    status: 'available'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createRoom, rooms } = useRooms();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.room_number.trim()) {
      newErrors.room_number = 'Room number is required';
    } else {
      // Check for duplicate room numbers
      const existingRoom = rooms.find(room => 
        room.room_number.toLowerCase() === formData.room_number.toLowerCase()
      );
      if (existingRoom) {
        newErrors.room_number = 'Room number already exists. Please use a different number.';
      }
    }

    if (!formData.room_type) {
      newErrors.room_type = 'Room type is required';
    }

    if (formData.floor < 1) {
      newErrors.floor = 'Floor must be at least 1';
    }

    if (formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    if (formData.price_per_night <= 0) {
      newErrors.price_per_night = 'Price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the form errors before submitting.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Submitting room data:', formData);
      await createRoom(formData);
      
      toast({
        title: 'Success',
        description: 'Room added successfully!',
      });
      
      // Reset form
      setFormData({
        room_number: '',
        room_type: '',
        floor: 1,
        capacity: 1,
        price_per_night: 0,
        amenities: [],
        status: 'available'
      });
      setErrors({});
      
      onClose();
    } catch (error: any) {
      console.error('Error adding room:', error);
      
      let errorMessage = 'Failed to add room. Please try again.';
      
      // Handle specific error cases
      if (error.message) {
        if (error.message.includes('duplicate key')) {
          errorMessage = 'Room number already exists. Please use a different number.';
          setErrors({ room_number: errorMessage });
        } else if (error.message.includes('hotel_id')) {
          errorMessage = 'Unable to determine your hotel. Please refresh and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form when closing
      setFormData({
        room_number: '',
        room_type: '',
        floor: 1,
        capacity: 1,
        price_per_night: 0,
        amenities: [],
        status: 'available'
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room_number">Room Number *</Label>
              <Input
                id="room_number"
                value={formData.room_number}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, room_number: e.target.value }));
                  // Clear error when user starts typing
                  if (errors.room_number) {
                    setErrors(prev => ({ ...prev, room_number: '' }));
                  }
                }}
                placeholder="e.g., 101"
                disabled={isSubmitting}
                className={errors.room_number ? 'border-red-500' : ''}
              />
              {errors.room_number && (
                <p className="text-sm text-destructive">{errors.room_number}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="floor">Floor *</Label>
              <Input
                id="floor"
                type="number"
                min="1"
                max="50"
                value={formData.floor}
                onChange={(e) => setFormData(prev => ({ ...prev, floor: parseInt(e.target.value) || 1 }))}
                disabled={isSubmitting}
              />
              {errors.floor && (
                <p className="text-sm text-destructive">{errors.floor}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room_type">Room Type *</Label>
              <Select 
                value={formData.room_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, room_type: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger className={errors.room_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.room_type && (
                <p className="text-sm text-destructive">{errors.room_type}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="10"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
                disabled={isSubmitting}
              />
              {errors.capacity && (
                <p className="text-sm text-destructive">{errors.capacity}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price_per_night">Price per Night ($) *</Label>
            <Input
              id="price_per_night"
              type="number"
              min="0"
              step="0.01"
              value={formData.price_per_night}
              onChange={(e) => setFormData(prev => ({ ...prev, price_per_night: parseFloat(e.target.value) || 0 }))}
              placeholder="e.g., 120.00"
              disabled={isSubmitting}
              className={errors.price_per_night ? 'border-red-500' : ''}
            />
            {errors.price_per_night && (
              <p className="text-sm text-destructive">{errors.price_per_night}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Amenities</Label>
            <div className="grid grid-cols-3 gap-3">
              {availableAmenities.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onCheckedChange={(checked) => handleAmenityChange(amenity, !!checked)}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor={amenity} className="text-sm font-normal">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding Room...
                </>
              ) : (
                'Add Room'
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
