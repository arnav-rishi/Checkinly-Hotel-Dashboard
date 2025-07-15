
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Settings, Lock, Unlock, Wrench, Sparkles, Trash2 } from 'lucide-react';

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

interface RoomManageModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (roomId: string, status: string) => Promise<void>;
  onDelete: (roomId: string) => Promise<void>;
}

export const RoomManageModal: React.FC<RoomManageModalProps> = ({ 
  room, 
  isOpen, 
  onClose, 
  onStatusChange,
  onDelete 
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!room) return null;

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      await onStatusChange(room.id, newStatus);
    } catch (error) {
      console.error('Failed to change room status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(room.id);
      setShowDeleteDialog(false);
      onClose();
    } catch (error) {
      console.error('Failed to delete room:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusActions = () => {
    switch (room.status) {
      case 'available':
        return [
          { 
            label: 'Mark as Occupied', 
            status: 'occupied', 
            icon: Lock, 
            variant: 'default' as const,
            description: 'Guest has checked in'
          },
          { 
            label: 'Start Cleaning', 
            status: 'cleaning', 
            icon: Sparkles, 
            variant: 'outline' as const,
            description: 'Room needs housekeeping'
          },
          { 
            label: 'Mark for Maintenance', 
            status: 'maintenance', 
            icon: Wrench, 
            variant: 'outline' as const,
            description: 'Room needs repairs'
          }
        ];
      case 'occupied':
        return [
          { 
            label: 'Check Out (Available)', 
            status: 'available', 
            icon: Unlock, 
            variant: 'outline' as const,
            description: 'Guest has checked out'
          },
          { 
            label: 'Start Cleaning', 
            status: 'cleaning', 
            icon: Sparkles, 
            variant: 'outline' as const,
            description: 'After checkout cleaning'
          }
        ];
      case 'cleaning':
        return [
          { 
            label: 'Mark as Available', 
            status: 'available', 
            icon: Unlock, 
            variant: 'default' as const,
            description: 'Cleaning completed'
          },
          { 
            label: 'Mark for Maintenance', 
            status: 'maintenance', 
            icon: Wrench, 
            variant: 'outline' as const,
            description: 'Issues found during cleaning'
          }
        ];
      case 'maintenance':
        return [
          { 
            label: 'Mark as Available', 
            status: 'available', 
            icon: Unlock, 
            variant: 'default' as const,
            description: 'Maintenance completed'
          },
          { 
            label: 'Start Cleaning', 
            status: 'cleaning', 
            icon: Sparkles, 
            variant: 'outline' as const,
            description: 'Clean after maintenance'
          }
        ];
      default:
        return [];
    }
  };

  const statusActions = getStatusActions();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Manage Room {room.room_number}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Status:</span>
              <Badge className={
                room.status === 'available' ? 'bg-green-100 text-green-800' :
                room.status === 'occupied' ? 'bg-blue-100 text-blue-800' :
                room.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                room.status === 'cleaning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }>
                {room.status}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Status Actions</h4>
              {statusActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <Button
                    key={action.status}
                    variant={action.variant}
                    className="w-full justify-start"
                    onClick={() => handleStatusChange(action.status)}
                    disabled={loading}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    <div className="text-left">
                      <div>{action.label}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium text-sm text-destructive">Danger Zone</h4>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Room
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room {room.room_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the room and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Deleting...' : 'Delete Room'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
