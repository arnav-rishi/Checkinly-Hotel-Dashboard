
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Users, Home, CalendarDays, BarChart3 } from 'lucide-react';
import { RevenueChart } from '@/components/RevenueChart';
import { BookingCalendar } from '@/components/BookingCalendar';

export const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7 Days');

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: '$124,892',
      change: '+12.5% vs last month',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Active Guests',
      value: '342',
      change: '+8.2% vs last month',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Occupancy Rate',
      value: '87.3%',
      change: '+3.1% vs last month',
      trend: 'up',
      icon: Home,
      color: 'text-purple-600'
    },
    {
      title: 'Access Events',
      value: '1,247',
      change: '+15.8% vs last month',
      trend: 'up',
      icon: CalendarDays,
      color: 'text-orange-600'
    }
  ];

  const recentActivity = [
    {
      icon: '👤',
      text: 'Sarah Johnson checked into room 305A',
      time: '2 minutes ago',
      status: 'success'
    },
    {
      icon: '💳',
      text: 'Payment of $450.00 received from Michael Chen',
      time: '5 minutes ago',
      status: 'success'
    },
    {
      icon: '🔑',
      text: 'Emma Davis accessed room 210B',
      time: '8 minutes ago',
      status: 'warning'
    },
    {
      icon: '👤',
      text: 'Robert Wilson checked out of room 156C',
      time: '12 minutes ago',
      status: 'success'
    }
  ];

  const paymentOverview = [
    { period: 'Today', amount: '$12,450', change: '+8.2%' },
    { period: 'This Week', amount: '$67,890', change: '+12.3%' },
    { period: 'This Month', amount: '$234,567', change: '+15.8%' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">Revenue analytics and performance insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{kpi.title}</p>
                  <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                  <div className="flex items-center mt-2">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className="text-sm text-green-600">{kpi.change}</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${kpi.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                  <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="charts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="charts">Charts & Analytics</TabsTrigger>
          <TabsTrigger value="calendar">Booking Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          {/* Revenue Analytics Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Revenue Analytics
                </CardTitle>
                <div className="flex gap-2">
                  {['7 Days', '30 Days', '90 Days'].map((period) => (
                    <Button
                      key={period}
                      variant={selectedPeriod === period ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPeriod(period)}
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RevenueChart />
            </CardContent>
          </Card>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Activity</CardTitle>
                  <Button variant="ghost" size="sm" className="text-primary">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="text-2xl">{activity.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{activity.text}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-500' : 
                        activity.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Payment Overview</CardTitle>
                  <Button variant="ghost" size="sm" className="text-primary">
                    View All Payments
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentOverview.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{payment.period}</p>
                          <p className="text-sm text-muted-foreground">Revenue</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{payment.amount}</p>
                        <p className="text-sm text-green-600">{payment.change}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <BookingCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
};
