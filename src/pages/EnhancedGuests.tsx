import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Mail, Phone, Calendar, Trash2, Edit, Loader2, AlertCircle } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { GuestFiltersDialog, GuestFilters } from '@/components/GuestFilters';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  id_number?: string;
  id_type?: string;
  address?: string;
  city?: string;
  country?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

interface GuestFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  id_number: string;
  id_type: string;
  address: string;
  city: string;
  country: string;
  date_of_birth: string;
}

const initialFormData: GuestFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  id_number: '',
  id_type: '',
  address: '',
  city: '',
  country: '',
  date_of_birth: ''
};

export const EnhancedGuests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<GuestFilters>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState<GuestFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<GuestFormData>>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

  const { loading: fetchLoading, execute: fetchGuests } = useApi();
  const { loading: submitLoading, execute: submitGuest } = useApi();
  const { loading: deleteLoading, execute: deleteGuest } = useApi();
  const { toast } = useToast();

  useEffect(() => {
    loadGuests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [guests, searchTerm, filters]);

  const applyFilters = () => {
    let filtered = [...guests];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(guest => {
        const fullName = `${guest.first_name} ${guest.last_name}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) ||
               guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (guest.phone && guest.phone.toLowerCase().includes(searchTerm.toLowerCase()));
      });
    }

    // Apply additional filters
    if (filters.country) {
      filtered = filtered.filter(guest => 
        guest.country?.toLowerCase().includes(filters.country!.toLowerCase())
      );
    }

    if (filters.city) {
      filtered = filtered.filter(guest => 
        guest.city?.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    if (filters.idType) {
      filtered = filtered.filter(guest => guest.id_type === filters.idType);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(guest => 
        new Date(guest.created_at) >= new Date(filters.dateFrom!)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(guest => 
        new Date(guest.created_at) <= new Date(filters.dateTo!)
      );
    }

    setFilteredGuests(filtered);
  };

  const handleFiltersChange = (newFilters: GuestFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const loadGuests = async () => {
    try {
      const result = await fetchGuests(async () => {
        const { data, error } = await supabase
          .from('guests')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      });
      
      if (result) {
        setGuests(result);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load guests",
        variant: "destructive",
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<GuestFormData> = {};

    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await submitGuest(async () => {
        if (editingGuest) {
          // Update existing guest
          const { data, error } = await supabase
            .from('guests')
            .update(formData)
            .eq('id', editingGuest.id)
            .select()
            .single();
          if (error) throw error;
          return data;
        } else {
          // Create new guest
          const { data, error } = await supabase
            .from('guests')
            .insert(formData)
            .select()
            .single();
          if (error) throw error;
          return data;
        }
      });

      if (result) {
        toast({
          title: "Success",
          description: `Guest ${editingGuest ? 'updated' : 'created'} successfully`,
        });
        resetForm();
        loadGuests(); // Refresh the list
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      first_name: guest.first_name,
      last_name: guest.last_name,
      email: guest.email,
      phone: guest.phone || '',
      id_number: guest.id_number || '',
      id_type: guest.id_type || '',
      address: guest.address || '',
      city: guest.city || '',
      country: guest.country || '',
      date_of_birth: guest.date_of_birth || ''
    });
    setFormErrors({});
    setIsAddDialogOpen(true);
  };

  const handleDelete = (guest: Guest) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Guest',
      description: `Are you sure you want to delete ${guest.first_name} ${guest.last_name}? This action cannot be undone.`,
      onConfirm: () => confirmDelete(guest.id)
    });
  };

  const confirmDelete = async (id: string) => {
    try {
      await deleteGuest(async () => {
        const { error } = await supabase
          .from('guests')
          .delete()
          .eq('id', id);
        if (error) throw error;
      });

      toast({
        title: "Success",
        description: 'Guest deleted successfully',
      });
      
      setConfirmDialog(prev => ({ ...prev, open: false }));
      loadGuests(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setEditingGuest(null);
    setIsAddDialogOpen(false);
  };

  const getStatusBadge = () => {
    return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Guest Management</h1>
          <p className="text-muted-foreground">Manage guest information and records</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Guest
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingGuest ? 'Edit Guest' : 'Add New Guest'}</DialogTitle>
                <DialogDescription>
                  {editingGuest ? 'Update guest information' : 'Enter guest details to create a new guest record'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      className={formErrors.first_name ? 'border-red-500' : ''}
                      disabled={submitLoading}
                    />
                    {formErrors.first_name && (
                      <span className="text-sm text-red-500">{formErrors.first_name}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      className={formErrors.last_name ? 'border-red-500' : ''}
                      disabled={submitLoading}
                    />
                    {formErrors.last_name && (
                      <span className="text-sm text-red-500">{formErrors.last_name}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={formErrors.email ? 'border-red-500' : ''}
                      disabled={submitLoading}
                    />
                    {formErrors.email && (
                      <span className="text-sm text-red-500">{formErrors.email}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className={formErrors.phone ? 'border-red-500' : ''}
                      disabled={submitLoading}
                    />
                    {formErrors.phone && (
                      <span className="text-sm text-red-500">{formErrors.phone}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="id_type">ID Type</Label>
                    <Select value={formData.id_type} onValueChange={(value) => setFormData(prev => ({ ...prev, id_type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="driver_license">Driver's License</SelectItem>
                        <SelectItem value="national_id">National ID</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="id_number">ID Number</Label>
                    <Input
                      id="id_number"
                      value={formData.id_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, id_number: e.target.value }))}
                      disabled={submitLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    disabled={submitLoading}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      disabled={submitLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      disabled={submitLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      disabled={submitLoading}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm} disabled={submitLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitLoading}>
                  {submitLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingGuest ? 'Update Guest' : 'Add Guest'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
          <GuestFiltersDialog
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>

      {/* Loading State */}
      {fetchLoading ? (
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
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-foreground">
                        {guest.first_name.charAt(0)}{guest.last_name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">
                        {guest.first_name} {guest.last_name}
                      </p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="w-4 h-4 mr-1" />
                        <span className="truncate">{guest.email}</span>
                      </div>
                    </div>
                    {getStatusBadge()}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {guest.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{guest.phone}</span>
                      </div>
                    )}
                    {guest.city && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{guest.city}, {guest.country}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(guest)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(guest)}
                      className="text-destructive hover:text-destructive"
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

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        loading={deleteLoading}
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  );
};
