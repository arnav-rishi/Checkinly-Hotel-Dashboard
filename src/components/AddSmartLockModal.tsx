
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { useRooms } from '@/hooks/useRooms';
import { useSmartLocks, SmartLock } from '@/hooks/useSmartLocks';
import { toast } from '@/hooks/use-toast';

export const AddSmartLockModal = () => {
  const { rooms } = useRooms();
  const { createSmartLock, creating } = useSmartLocks();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    lock_id: '',
    room_id: '',
    type: 'NFC' as 'NFC' | 'Passcode',
    status: 'locked' as 'locked' | 'unlocked'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.lock_id || !formData.room_id) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      const lockData: Omit<SmartLock, 'id' | 'created_at' | 'updated_at' | 'hotel_id' | 'created_by'> = {
        lock_id: formData.lock_id,
        room_id: formData.room_id,
        status: formData.status,
        type: formData.type,
        battery_level: 100, // Default to full battery for new locks
        signal_strength: 85, // Default to good signal
        last_heartbeat: new Date().toISOString(),
        last_ping: new Date().toISOString(),
        error_message: null
      };

      await createSmartLock(lockData);
      setOpen(false);
      setFormData({
        lock_id: '',
        room_id: '',
        type: 'NFC',
        status: 'locked'
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New Smart Lock
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Smart Lock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lock_id">Lock ID / Name *</Label>
            <Input
              id="lock_id"
              value={formData.lock_id}
              onChange={(e) => handleChange('lock_id', e.target.value)}
              placeholder="e.g., LOCK-001 or Main Door Lock"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="room_id">Associated Room *</Label>
            <Select value={formData.room_id} onValueChange={(value) => handleChange('room_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map(room => (
                  <SelectItem key={room.id} value={room.id}>
                    Room {room.room_number} ({room.room_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Lock Type</Label>
            <Select value={formData.type} onValueChange={(value: 'NFC' | 'Passcode') => handleChange('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NFC">NFC</SelectItem>
                <SelectItem value="Passcode">Passcode</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Initial Status</Label>
            <Select value={formData.status} onValueChange={(value: 'locked' | 'unlocked') => handleChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="locked">Locked</SelectItem>
                <SelectItem value="unlocked">Unlocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Add Lock'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
