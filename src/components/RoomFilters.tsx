
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export interface RoomFilters {
  status?: string;
  roomType?: string;
  floor?: string;
  minPrice?: string;
  maxPrice?: string;
  capacity?: string;
}

interface RoomFiltersProps {
  filters: RoomFilters;
  onFiltersChange: (filters: RoomFilters) => void;
  onClearFilters: () => void;
}

export const RoomFiltersDialog: React.FC<RoomFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<RoomFilters>(filters);

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setTempFilters({});
    onFiltersChange({});
    onClearFilters();
    setIsOpen(false);
  };

  const activeFiltersCount = Object.values(filters).filter(value => value && value.trim()).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filter Rooms
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 bg-primary text-primary-foreground">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Rooms</DialogTitle>
          <DialogDescription>
            Apply filters to find specific rooms
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={tempFilters.status || 'all'} 
                onValueChange={(value) => setTempFilters(prev => ({ 
                  ...prev, 
                  status: value === 'all' ? undefined : value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomType">Room Type</Label>
              <Select 
                value={tempFilters.roomType || 'all'} 
                onValueChange={(value) => setTempFilters(prev => ({ 
                  ...prev, 
                  roomType: value === 'all' ? undefined : value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="double">Double</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                  <SelectItem value="deluxe">Deluxe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                type="number"
                placeholder="Floor number"
                value={tempFilters.floor || ''}
                onChange={(e) => setTempFilters(prev => ({ ...prev, floor: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Select 
                value={tempFilters.capacity || 'all'} 
                onValueChange={(value) => setTempFilters(prev => ({ 
                  ...prev, 
                  capacity: value === 'all' ? undefined : value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any capacity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any capacity</SelectItem>
                  <SelectItem value="1">1 person</SelectItem>
                  <SelectItem value="2">2 people</SelectItem>
                  <SelectItem value="3">3 people</SelectItem>
                  <SelectItem value="4">4+ people</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minPrice">Min Price</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="$0"
                value={tempFilters.minPrice || ''}
                onChange={(e) => setTempFilters(prev => ({ ...prev, minPrice: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPrice">Max Price</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="$1000"
                value={tempFilters.maxPrice || ''}
                onChange={(e) => setTempFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleApplyFilters} className="flex-1">
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear All
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
