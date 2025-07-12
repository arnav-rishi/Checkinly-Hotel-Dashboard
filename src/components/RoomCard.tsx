
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Eye, LogOut, Calendar } from 'lucide-react';

interface RoomCardProps {
  number: string;
  floor: string;
  type: string;
  status: string;
  guest?: string;
  guestId?: string;
  statusColor: string;
  actions: string[];
}

export const RoomCard: React.FC<RoomCardProps> = ({
  number,
  floor,
  type,
  status,
  guest,
  guestId,
  statusColor,
  actions
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'Occupied':
        return '👤';
      case 'Available':
        return '✅';
      case 'Maintenance':
        return '🔧';
      case 'Cleaning':
        return '🧹';
      case 'Out Of Order':
        return '❌';
      default:
        return '📍';
    }
  };

  const getStatusBadge = () => {
    const colorMap: Record<string, string> = {
      'Occupied': 'bg-blue-100 text-blue-800',
      'Available': 'bg-green-100 text-green-800',
      'Maintenance': 'bg-yellow-100 text-yellow-800',
      'Cleaning': 'bg-orange-100 text-orange-800',
      'Out Of Order': 'bg-red-100 text-red-800'
    };
    
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{getStatusIcon()}</span>
              <h3 className="text-xl font-bold">Room {number}</h3>
            </div>
            <p className="text-sm text-gray-500">Floor {floor}</p>
          </div>
          <Badge className={getStatusBadge()}>
            {status}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <p className="font-medium">{type}</p>
          {guest && (
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Primary Guest</p>
              <p className="font-medium">{guest}</p>
              {guestId && (
                <p className="text-xs text-gray-500">Guest ID: {guestId}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Button
              key={action}
              variant={action === 'Check Out' ? 'destructive' : action === 'Book Room' ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
            >
              {action === 'View Details' && <Eye className="w-3 h-3 mr-1" />}
              {action === 'Check Out' && <LogOut className="w-3 h-3 mr-1" />}
              {action === 'Book Room' && <Calendar className="w-3 h-3 mr-1" />}
              {action}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
