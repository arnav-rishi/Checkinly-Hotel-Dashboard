
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Bed, Users, DollarSign, MapPin, Edit, Trash2, Loader2, AlertCircle, Eye, Settings } from 'lucide-react';
import { useRooms } from '@/hooks/useRooms';
import { RoomFiltersDialog, RoomFilters } from '@/components/RoomFilters';
import { RoomViewModal } from '@/components/RoomViewModal';
import { RoomEditModal } from '@/components/RoomEditModal';
import { RoomManageModal } from '@/components/RoomManageModal';
import { useToast } from '@/hooks/use-toast';

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

export const Rooms = () => {
  const { rooms, loading, updateRoom, deleteRoom } = useRooms();
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<RoomFilters>({});
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    applyFilters();
  }, [rooms, searchTerm, filters]);

  const applyFilters = () => {
    let filtered = [...rooms];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.room_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply additional filters
    if (filters.status) {
      filtered = filtered.filter(room => room.status === filters.status);
    }

    if (filters.roomType) {
      filtered = filtered.filter(room => room.room_type === filters.roomType);
    }

    if (filters.floor) {
      filtered = filtered.filter(room => room.floor === parseInt(filters.floor!));
    }

    if (filters.capacity) {
      const capacity = parseInt(filters.capacity!);
      if (capacity === 4) {
        filtered = filtered.filter(room => room.capacity >= 4);
      } else {
        filtered = filtered.filter(room => room.capacity === capacity);
      }
    }

    if (filters.minPrice) {
      filtered = filtered.filter(room => room.price_per_night >= parseFloat(filters.minPrice!));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(room => room.price_per_night <= parseFloat(filters.maxPrice!));
    }

    setFilteredRooms(filtered);
  };

  const handleFiltersChange = (newFilters: RoomFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

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

  const handleViewRoom = (room: Room) => {
    setSelectedRoom(room);
    setViewModalOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setEditModalOpen(true);
  };

  const handleManageRoom = (room: Room) => {
    setSelectedRoom(room);
    setManageModalOpen(true);
  };

  const handleSaveRoom = async (roomId: string, updates: Partial<Room>) => {
    try {
      await updateRoom(roomId, updates);
      toast({
        title: "Success",
        description: "Room updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update room",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleStatusChange = async (roomId: string, status: string) => {
    try {
      await updateRoom(roomId, { status });
      toast({
        title: "Success",
        description: "Room status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update room status",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await deleteRoom(roomId);
      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Room Management</h1>
          <p className="text-muted-foreground">Manage hotel rooms and their availability</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Room
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search rooms by number or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <RoomFiltersDialog
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* Results Summary */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredRooms.length} of {rooms.length} rooms
            {Object.values(filters).some(v => v) && (
              <Button 
                variant="link" 
                className="p-0 h-auto ml-2 text-sm"
                onClick={handleClearFilters}
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Room Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Room {room.room_number}</CardTitle>
                      <CardDescription className="capitalize">{room.room_type}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(room.status)}>
                      {room.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span>${room.price_per_night}/night</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{room.capacity} guests</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Floor {room.floor}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Bed className="w-4 h-4 mr-2" />
                      <span>{room.room_type}</span>
                    </div>
                  </div>

                  {room.amenities && room.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 3).map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {room.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{room.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewRoom(room)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRoom(room)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageRoom(room)}
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRooms.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No rooms found</h3>
              <p className="text-muted-foreground">
                {Object.values(filters).some(v => v) || searchTerm
                  ? 'Try adjusting your search or filters'
                  : 'Try adding a new room'
                }
              </p>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <RoomViewModal
        room={selectedRoom}
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedRoom(null);
        }}
      />

      <RoomEditModal
        room={selectedRoom}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedRoom(null);
        }}
        onSave={handleSaveRoom}
      />

      <RoomManageModal
        room={selectedRoom}
        isOpen={manageModalOpen}
        onClose={() => {
          setManageModalOpen(false);
          setSelectedRoom(null);
        }}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteRoom}
      />
    </div>
  );
};
