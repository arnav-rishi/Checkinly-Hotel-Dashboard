
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, User, Mail, Phone, MapPin, Calendar, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useGuests } from '@/hooks/useGuests';
import { GuestFilters, GuestFilterOptions } from '@/components/GuestFilters';
import { GuestAddModal } from '@/components/GuestAddModal';
import { useToast } from '@/hooks/use-toast';

export const EnhancedGuests = () => {
  const { guests, loading, deleteGuest } = useGuests();
  const [filteredGuests, setFilteredGuests] = useState(guests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<GuestFilterOptions>({});
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    applyFilters();
  }, [guests, searchTerm, filters]);

  const applyFilters = () => {
    let filtered = [...guests];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(guest =>
        guest.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply additional filters
    if (filters.country) {
      filtered = filtered.filter(guest => guest.country?.toLowerCase() === filters.country!.toLowerCase());
    }

    if (filters.city) {
      filtered = filtered.filter(guest => guest.city?.toLowerCase() === filters.city!.toLowerCase());
    }

    if (filters.id_type) {
      filtered = filtered.filter(guest => guest.id_type === filters.id_type);
    }

    setFilteredGuests(filtered);
  };

  const handleFiltersChange = (newFilters: GuestFilterOptions) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (window.confirm('Are you sure you want to delete this guest?')) {
      try {
        await deleteGuest(guestId);
        toast({
          title: "Success",
          description: "Guest deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete guest",
          variant: "destructive",
        });
      }
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Guest Management</h1>
          <p className="text-muted-foreground">Manage hotel guests and their information</p>
        </div>
        <Button onClick={() => setAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Guest
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search guests by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <GuestFilters
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
            Showing {filteredGuests.length} of {guests.length} guests
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

          {/* Guest Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuests.map((guest) => (
              <Card key={guest.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{guest.first_name} {guest.last_name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Mail className="h-3 w-3 mr-1" />
                          {guest.email}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {guest.phone && (
                      <div className="flex items-center text-muted-foreground">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{guest.phone}</span>
                      </div>
                    )}
                    {guest.city && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{guest.city}{guest.country && `, ${guest.country}`}</span>
                      </div>
                    )}
                    {guest.date_of_birth && (
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>DOB: {formatDate(guest.date_of_birth)}</span>
                      </div>
                    )}
                  </div>

                  {guest.id_type && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {guest.id_type}: {guest.id_number || 'N/A'}
                      </Badge>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteGuest(guest.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredGuests.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No guests found</h3>
              <p className="text-muted-foreground">
                {Object.values(filters).some(v => v) || searchTerm
                  ? 'Try adjusting your search or filters'
                  : 'Try adding a new guest'
                }
              </p>
            </div>
          )}
        </>
      )}

      {/* Add Guest Modal */}
      <GuestAddModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </div>
  );
};
