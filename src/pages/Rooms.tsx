import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';
import { supabase } from '@/integrations/supabase/client';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  floor: number;
  capacity: number;
  price_per_night: number;
  status: string;
  amenities: string[];
}

export const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteRoom, setDeleteRoom] = useState<Room | null>(null);
  
  const { toast } = useToast();
  const { execute: fetchRooms, loading: fetchLoading } = useApi();
  const { execute: saveRoom, loading: saveLoading } = useApi();
  const { execute: deleteRoomApi, loading: deleteLoading } = useApi();

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    const result = await fetchRooms(async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number');
      if (error) throw error;
      return data;
    });

    if (result) {
      setRooms(result);
    }
  };

  const handleSaveRoom = async (roomData: any) => {
    try {
      const result = await saveRoom(async () => {
        if (editingRoom) {
          // Update existing room
          const { data, error } = await supabase
            .from('rooms')
            .update(roomData)
            .eq('id', editingRoom.id)
            .select()
            .single();
          if (error) throw error;
          return data;
        } else {
          // Create new room
          const { data, error } = await supabase
            .from('rooms')
            .insert(roomData)
            .select()
            .single();
          if (error) throw error;
          return data;
        }
      });

      if (result) {
        toast({
          title: "Success",
          description: `Room ${editingRoom ? 'updated' : 'created'} successfully`,
        });
        setIsDialogOpen(false);
        setEditingRoom(null);
        loadRooms();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoom = async () => {
    if (!deleteRoom) return;

    try {
      await deleteRoomApi(async () => {
        const { error } = await supabase
          .from('rooms')
          .delete()
          .eq('id', deleteRoom.id);
        if (error) throw error;
      });

      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
      setDeleteRoom(null);
      loadRooms();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-blue-100 text-blue-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      cleaning: 'bg-orange-100 text-orange-800'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.room_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesType = typeFilter === 'all' || room.room_type.toLowerCase().includes(typeFilter.toLowerCase());
    const matchesFloor = floorFilter === 'all' || room.floor.toString() === floorFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesFloor;
  });

  const RoomForm = ({ room, onSave }: { room?: Room | null; onSave: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      room_number: room?.room_number || '',
      room_type: room?.room_type || '',
      floor: room?.floor || 1,
      capacity: room?.capacity || 2,
      price_per_night: room?.price_per_night || 0,
      status: room?.status || 'available',
      amenities: room?.amenities || []
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="room_number">Room Number</Label>
            <Input
              id="room_number"
              value={formData.room_number}
              onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="room_type">Room Type</Label>
            <Select value={formData.room_type} onValueChange={(value) => setFormData({ ...formData, room_type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Deluxe">Deluxe</SelectItem>
                <SelectItem value="Suite">Suite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="floor">Floor</Label>
            <Input
              id="floor"
              type="number"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label htmlFor="price_per_night">Price per Night</Label>
            <Input
              id="price_per_night"
              type="number"
              step="0.01"
              value={formData.price_per_night}
              onChange={(e) => setFormData({ ...formData, price_per_night: parseFloat(e.target.value) })}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saveLoading}>
            {saveLoading ? 'Saving...' : (room ? 'Update Room' : 'Create Room')}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Room Management</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor all rooms in your hotel</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingRoom(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
            </DialogHeader>
            <RoomForm room={editingRoom} onSave={handleSaveRoom} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by room number or type"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="deluxe">Deluxe</SelectItem>
              <SelectItem value="suite">Suite</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={floorFilter} onValueChange={setFloorFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Floors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Floors</SelectItem>
              <SelectItem value="1">Floor 1</SelectItem>
              <SelectItem value="2">Floor 2</SelectItem>
              <SelectItem value="3">Floor 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rooms Grid */}
      {fetchLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Room {room.room_number}</CardTitle>
                  <Badge className={getStatusBadge(room.status)}>
                    {room.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium">{room.room_type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Floor:</span>
                    <p className="font-medium">{room.floor}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Capacity:</span>
                    <p className="font-medium">{room.capacity} guests</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price:</span>
                    <p className="font-medium">${room.price_per_night}/night</p>
                  </div>
                </div>
                
                {room.amenities && room.amenities.length > 0 && (
                  <div>
                    <span className="text-muted-foreground text-sm">Amenities:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {room.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingRoom(room);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteRoom(room)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteRoom}
        onOpenChange={(open) => !open && setDeleteRoom(null)}
        onConfirm={handleDeleteRoom}
        title="Delete Room"
        description={`Are you sure you want to delete room ${deleteRoom?.room_number}? This action cannot be undone.`}
        loading={deleteLoading}
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  );
};