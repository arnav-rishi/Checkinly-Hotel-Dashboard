
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/hooks/useSettings';
import { useUIActions } from '@/hooks/useUIActions';
import { Loader2, Save, Sparkles } from 'lucide-react';
import { seedDemoData } from '@/utils/demoData';

export const SettingsActions = () => {
  const { loading, saving, saveHotelSettings, loadHotelSettings } = useSettings();
  const { executeAction } = useUIActions();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
    timezone: 'UTC-5 (Eastern)'
  });

  useEffect(() => {
    const hotelSettings = loadHotelSettings();
    setFormData({
      name: hotelSettings.name || '',
      address: hotelSettings.address || '',
      email: hotelSettings.email || '',
      phone: hotelSettings.phone || '',
      timezone: hotelSettings.timezone || 'UTC-5 (Eastern)'
    });
  }, [loadHotelSettings]);

  const handleSave = async () => {
    await executeAction(
      () => saveHotelSettings(formData),
      {
        successMessage: 'Settings saved successfully!',
        errorMessage: 'Failed to save settings. Please try again.'
      }
    );
  };

  const [generating, setGenerating] = useState(false);

  const handleGenerateDemoData = async () => {
    setGenerating(true);
    try {
      await executeAction(
        () => seedDemoData({ roomsCount: 20, guestsCount: 30, locksCount: 10 }),
        {
          successMessage: 'Demo data generated!',
          errorMessage: 'Failed to generate demo data.'
        }
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hotel Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Hotel Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter hotel name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="hotel@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Hotel address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={formData.timezone}
              onValueChange={(value) => handleInputChange('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC-5 (Eastern)">UTC-5 (Eastern)</SelectItem>
                <SelectItem value="UTC-6 (Central)">UTC-6 (Central)</SelectItem>
                <SelectItem value="UTC-7 (Mountain)">UTC-7 (Mountain)</SelectItem>
                <SelectItem value="UTC-8 (Pacific)">UTC-8 (Pacific)</SelectItem>
                <SelectItem value="UTC+0 (GMT)">UTC+0 (GMT)</SelectItem>
                <SelectItem value="UTC+1 (CET)">UTC+1 (CET)</SelectItem>
                <SelectItem value="UTC+9 (JST)">UTC+9 (JST)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Demo Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Populate your dashboard with sample rooms, guests, bookings, and smart locks for demo purposes.
          </p>
          <Button onClick={handleGenerateDemoData} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Demo Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
