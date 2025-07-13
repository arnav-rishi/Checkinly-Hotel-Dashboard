
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';
import { 
  Building2, 
  Users, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database, 
  Mail,
  Phone,
  MapPin,
  Save,
  RefreshCw
} from 'lucide-react';

export const Settings = () => {
  const { toast } = useToast();
  const { execute: saveSettings, loading: saveLoading } = useApi();
  
  const [notifications, setNotifications] = useState({
    checkIns: true,
    payments: true,
    maintenance: false,
    security: true,
    lowBattery: true
  });

  const [hotelInfo, setHotelInfo] = useState({
    name: 'Grand Plaza Hotel',
    address: '123 Main Street, City, State 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@grandplaza.com',
    timezone: 'UTC-5 (Eastern)'
  });

  const settingsSections = [
    {
      title: 'Hotel Information',
      icon: Building2,
      settings: [
        { label: 'Hotel Name', value: 'Grand Plaza Hotel', type: 'input' },
        { label: 'Address', value: '123 Main Street, City, State 12345', type: 'input' },
        { label: 'Phone', value: '+1 (555) 123-4567', type: 'input' },
        { label: 'Email', value: 'info@grandplaza.com', type: 'input' },
        { label: 'Time Zone', value: 'UTC-5 (Eastern)', type: 'select' }
      ]
    },
    {
      title: 'User Management',
      icon: Users,
      settings: [
        { label: 'Default User Role', value: 'Staff', type: 'select' },
        { label: 'Password Policy', value: 'Strong', type: 'select' },
        { label: 'Session Timeout', value: '30 minutes', type: 'select' },
        { label: 'Two-Factor Authentication', value: true, type: 'toggle' }
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      settings: [
        { label: 'Audit Logging', value: true, type: 'toggle' },
        { label: 'Failed Login Attempts', value: '5', type: 'select' },
        { label: 'IP Whitelisting', value: false, type: 'toggle' },
        { label: 'Data Encryption', value: true, type: 'toggle' }
      ]
    },
    {
      title: 'Appearance',
      icon: Palette,
      settings: [
        { label: 'Theme', value: 'Light', type: 'select' },
        { label: 'Primary Color', value: 'Blue', type: 'select' },
        { label: 'Language', value: 'English', type: 'select' },
        { label: 'Date Format', value: 'MM/DD/YYYY', type: 'select' }
      ]
    }
  ];

  const handleSaveSettings = async () => {
    try {
      await saveSettings(async () => {
        // Simulate API call - in real app this would save to database
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
      });

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  const handleResetSettings = () => {
    setNotifications({
      checkIns: true,
      payments: true,
      maintenance: false,
      security: true,
      lowBattery: true
    });
    setHotelInfo({
      name: 'Grand Plaza Hotel',
      address: '123 Main Street, City, State 12345',
      phone: '+1 (555) 123-4567',
      email: 'info@grandplaza.com',
      timezone: 'UTC-5 (Eastern)'
    });
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your hotel management system preferences</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button onClick={handleSaveSettings} disabled={saveLoading} className="flex items-center gap-2">
          {saveLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saveLoading ? 'Saving...' : 'Save All Changes'}
        </Button>
        <Button variant="outline" onClick={handleResetSettings} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Reset to Defaults
        </Button>
      </div>

      {/* Notifications Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Check-in Notifications</p>
                <p className="text-sm text-gray-500">Get notified when guests check in</p>
              </div>
              <Switch 
                checked={notifications.checkIns}
                onCheckedChange={(checked) => setNotifications({...notifications, checkIns: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Payment Alerts</p>
                <p className="text-sm text-gray-500">Receive payment confirmations</p>
              </div>
              <Switch 
                checked={notifications.payments}
                onCheckedChange={(checked) => setNotifications({...notifications, payments: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Maintenance Requests</p>
                <p className="text-sm text-gray-500">Maintenance issue notifications</p>
              </div>
              <Switch 
                checked={notifications.maintenance}
                onCheckedChange={(checked) => setNotifications({...notifications, maintenance: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Security Alerts</p>
                <p className="text-sm text-gray-500">Security-related notifications</p>
              </div>
              <Switch 
                checked={notifications.security}
                onCheckedChange={(checked) => setNotifications({...notifications, security: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Low Battery Warnings</p>
                <p className="text-sm text-gray-500">Smart lock battery alerts</p>
              </div>
              <Switch 
                checked={notifications.lowBattery}
                onCheckedChange={(checked) => setNotifications({...notifications, lowBattery: checked})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hotel Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Hotel Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Hotel Name</label>
              <Input
                value={hotelInfo.name}
                onChange={(e) => setHotelInfo(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={hotelInfo.email}
                onChange={(e) => setHotelInfo(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={hotelInfo.phone}
                onChange={(e) => setHotelInfo(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Zone</label>
              <Select value={hotelInfo.timezone} onValueChange={(value) => setHotelInfo(prev => ({ ...prev, timezone: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC-5 (Eastern)">UTC-5 (Eastern)</SelectItem>
                  <SelectItem value="UTC-6 (Central)">UTC-6 (Central)</SelectItem>
                  <SelectItem value="UTC-7 (Mountain)">UTC-7 (Mountain)</SelectItem>
                  <SelectItem value="UTC-8 (Pacific)">UTC-8 (Pacific)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <Input
              value={hotelInfo.address}
              onChange={(e) => setHotelInfo(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingsSections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <section.icon className="w-5 h-5" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.settings.map((setting) => (
                <div key={setting.label} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{setting.label}</p>
                  </div>
                  <div className="flex-1 max-w-xs">
                    {setting.type === 'input' && (
                      <Input
                        defaultValue={setting.value as string}
                        className="w-full text-sm"
                      />
                    )}
                    {setting.type === 'select' && (
                      <Select defaultValue={setting.value as string}>
                        <SelectTrigger className="w-full h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={setting.value as string}>{setting.value as string}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {setting.type === 'toggle' && (
                      <Switch defaultChecked={setting.value as boolean} />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Payment Gateway</h4>
                <Switch defaultChecked />
              </div>
              <p className="text-sm text-gray-500">Stripe integration for payments</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Email Service</h4>
                <Switch defaultChecked />
              </div>
              <p className="text-sm text-gray-500">SMTP for email notifications</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Backup Service</h4>
                <Switch defaultChecked />
              </div>
              <p className="text-sm text-gray-500">Automated daily backups</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
