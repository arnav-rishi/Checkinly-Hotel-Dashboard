
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

export interface GuestFilters {
  country?: string;
  city?: string;
  idType?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface GuestFiltersProps {
  filters: GuestFilters;
  onFiltersChange: (filters: GuestFilters) => void;
  onClearFilters: () => void;
}

export const GuestFiltersDialog: React.FC<GuestFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<GuestFilters>(filters);

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
          More Filters
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 bg-primary text-primary-foreground">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Guests</DialogTitle>
          <DialogDescription>
            Apply additional filters to find specific guests
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="Enter country"
                value={tempFilters.country || ''}
                onChange={(e) => setTempFilters(prev => ({ ...prev, country: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Enter city"
                value={tempFilters.city || ''}
                onChange={(e) => setTempFilters(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idType">ID Type</Label>
            <Select 
              value={tempFilters.idType || 'all'} 
              onValueChange={(value) => setTempFilters(prev => ({ 
                ...prev, 
                idType: value === 'all' ? undefined : value 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ID types</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="driver_license">Driver's License</SelectItem>
                <SelectItem value="national_id">National ID</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Created From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={tempFilters.dateFrom || ''}
                onChange={(e) => setTempFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Created To</Label>
              <Input
                id="dateTo"
                type="date"
                value={tempFilters.dateTo || ''}
                onChange={(e) => setTempFilters(prev => ({ ...prev, dateTo: e.target.value }))}
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
