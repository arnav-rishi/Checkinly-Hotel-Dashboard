import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Mail, Phone, Calendar, Trash2, Edit, Loader2, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useApi, mockApi } from '@/hooks/useApi';
import { toast } from '@/hooks/use-toast';

interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  room?: string;
  checkIn?: string;
  checkOut?: string;
  status: 'checked-in' | 'checked-out' | 'reserved' | 'cancelled';
  notes?: string;
}

interface GuestFormData {
  name: string;
  email: string;
  phone: string;
  room: string;
  checkIn: string;
  checkOut: string;
  notes: string;
}

const initialFormData: GuestFormData = {
  name: '',
  email: '',
  phone: '',
  room: '',
  checkIn: '',
  checkOut: '',
  notes: ''
};

export const EnhancedGuests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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

  // Load guests on component mount
  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    try {
      const data = await fetchGuests(() => mockApi.getGuests(), { showSuccessToast: false }) as Guest[];
      setGuests(Array.isArray(data) ? data : []);
    } catch (error) {
      // Error handled by useApi hook
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<GuestFormData> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone is required';
    }

    if (!formData.room.trim()) {
      errors.room = 'Room is required';
    }

    if (!formData.checkIn) {
      errors.checkIn = 'Check-in date is required';
    }

    if (!formData.checkOut) {
      errors.checkOut = 'Check-out date is required';
    }

    if (formData.checkIn && formData.checkOut && new Date(formData.checkIn) >= new Date(formData.checkOut)) {
      errors.checkOut = 'Check-out date must be after check-in date';
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
      if (editingGuest) {
        // Update existing guest
        const updatedGuest = await submitGuest(
          () => mockApi.updateGuest(editingGuest.id, { ...formData, status: editingGuest.status }),
          { successMessage: 'Guest updated successfully' }
        );
        setGuests(prev => prev.map(g => g.id === editingGuest.id ? updatedGuest : g));
      } else {
        // Add new guest
        const newGuest = await submitGuest(
          () => mockApi.addGuest({ ...formData, status: 'reserved' }),
          { successMessage: 'Guest added successfully' }
        );
        setGuests(prev => [...prev, newGuest]);
      }

      resetForm();
    } catch (error) {
      // Error handled by useApi hook
    }
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.name,
      email: guest.email,
      phone: guest.phone || '',
      room: guest.room || '',
      checkIn: guest.checkIn || '',
      checkOut: guest.checkOut || '',
      notes: guest.notes || ''
    });
    setFormErrors({});
    setIsAddDialogOpen(true);
  };

  const handleDelete = (guest: Guest) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Guest',
      description: `Are you sure you want to delete ${guest.name}? This action cannot be undone.`,
      onConfirm: () => confirmDelete(guest.id)
    });
  };

  const confirmDelete = async (id: string) => {
    try {
      await deleteGuest(
        () => mockApi.deleteGuest(id),
        { successMessage: 'Guest deleted successfully' }
      );
      setGuests(prev => prev.filter(g => g.id !== id));
      setConfirmDialog(prev => ({ ...prev, open: false }));
    } catch (error) {
      // Error handled by useApi hook
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setEditingGuest(null);
    setIsAddDialogOpen(false);
  };

  const getStatusBadge = (status: Guest['status']) => {
    switch (status) {
      case 'checked-in':
        return <Badge className="bg-green-100 text-green-800">Checked In</Badge>;
      case 'checked-out':
        return <Badge variant="secondary">Checked Out</Badge>;
      case 'reserved':
        return <Badge className="bg-blue-100 text-blue-800">Reserved</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (guest.room && guest.room.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || guest.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Guest Management</h1>
          <p className="text-muted-foreground">Manage guest information, check-ins, and reservations</p>
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
                  {editingGuest ? 'Update guest information' : 'Enter guest details to create a new reservation'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={formErrors.name ? 'border-destructive' : ''}
                      aria-describedby={formErrors.name ? 'name-error' : undefined}
                    />
                    {formErrors.name && (
                      <p id="name-error" className="text-sm text-destructive">{formErrors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={formErrors.email ? 'border-destructive' : ''}
                      aria-describedby={formErrors.email ? 'email-error' : undefined}
                    />
                    {formErrors.email && (
                      <p id="email-error" className="text-sm text-destructive">{formErrors.email}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className={formErrors.phone ? 'border-destructive' : ''}
                      aria-describedby={formErrors.phone ? 'phone-error' : undefined}
                    />
                    {formErrors.phone && (
                      <p id="phone-error" className="text-sm text-destructive">{formErrors.phone}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room">Room *</Label>
                    <Input
                      id="room"
                      value={formData.room}
                      onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                      className={formErrors.room ? 'border-destructive' : ''}
                      aria-describedby={formErrors.room ? 'room-error' : undefined}
                    />
                    {formErrors.room && (
                      <p id="room-error" className="text-sm text-destructive">{formErrors.room}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkIn">Check-in Date *</Label>
                    <Input
                      id="checkIn"
                      type="date"
                      value={formData.checkIn}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                      className={formErrors.checkIn ? 'border-destructive' : ''}
                      aria-describedby={formErrors.checkIn ? 'checkIn-error' : undefined}
                    />
                    {formErrors.checkIn && (
                      <p id="checkIn-error" className="text-sm text-destructive">{formErrors.checkIn}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkOut">Check-out Date *</Label>
                    <Input
                      id="checkOut"
                      type="date"
                      value={formData.checkOut}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                      className={formErrors.checkOut ? 'border-destructive' : ''}
                      aria-describedby={formErrors.checkOut ? 'checkOut-error' : undefined}
                    />
                    {formErrors.checkOut && (
                      <p id="checkOut-error" className="text-sm text-destructive">{formErrors.checkOut}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about the guest or reservation..."
                  />
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
            placeholder="Search guests by name, email, or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="checked-in">Checked In</SelectItem>
              <SelectItem value="checked-out">Checked Out</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
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
          </div>

          {/* Guest Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuests.map((guest) => (
              <Card key={guest.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{guest.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {guest.email}
                      </CardDescription>
                    </div>
                    {getStatusBadge(guest.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {guest.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {guest.phone}
                    </div>
                  )}
                  {guest.room && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Room:</span>
                      {guest.room}
                    </div>
                  )}
                  {guest.checkIn && guest.checkOut && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(guest.checkIn).toLocaleDateString()} - {new Date(guest.checkOut).toLocaleDateString()}
                    </div>
                  )}
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
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
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