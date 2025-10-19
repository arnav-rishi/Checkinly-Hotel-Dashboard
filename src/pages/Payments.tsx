import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, Download, DollarSign, CreditCard, Receipt, TrendingUp } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { supabase } from '@/integrations/supabase/client';

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  transaction_id: string | null;
  paid_at: string | null;
  created_at: string;
  booking: {
    id: string;
    guest: {
      first_name: string;
      last_name: string;
    };
    room: {
      room_number: string;
    };
  };
}

interface PaymentStats {
  totalRevenue: number;
  pendingPayments: number;
  failedTransactions: number;
  successRate: number;
}

export const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    pendingPayments: 0,
    failedTransactions: 0,
    successRate: 0
  });

  const { execute: fetchPayments, loading: fetchLoading } = useApi();

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    const result = await fetchPayments(async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          booking:bookings(
            id,
            guest:guests(first_name, last_name),
            room:rooms(room_number)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    });

    if (result) {
      setPayments(result);
      calculateStats(result);
    }
  };

  const calculateStats = (paymentsData: Payment[]) => {
    const totalRevenue = paymentsData
      .filter(p => p.payment_status === 'completed')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    
    const pendingPayments = paymentsData
      .filter(p => p.payment_status === 'pending')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    
    const failedTransactions = paymentsData
      .filter(p => p.payment_status === 'failed')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    
    const completedCount = paymentsData.filter(p => p.payment_status === 'completed').length;
    const successRate = paymentsData.length > 0 ? (completedCount / paymentsData.length) * 100 : 0;

    setStats({
      totalRevenue,
      pendingPayments,
      failedTransactions,
      successRate
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'credit card':
        return <CreditCard className="w-4 h-4" />;
      case 'paypal':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const guestName = `${payment.booking?.guest?.first_name} ${payment.booking?.guest?.last_name}`.toLowerCase();
    const roomNumber = payment.booking?.room?.room_number?.toLowerCase() || '';
    const transactionId = payment.transaction_id?.toLowerCase() || '';
    
    const matchesSearch = guestName.includes(searchTerm.toLowerCase()) ||
                         roomNumber.includes(searchTerm.toLowerCase()) ||
                         transactionId.includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.payment_status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.payment_method.toLowerCase().includes(methodFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payment Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage all payment transactions</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">+12.5%</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Pending Payments</p>
                <p className="text-2xl font-bold text-foreground">${stats.pendingPayments.toLocaleString()}</p>
                <p className="text-sm text-yellow-600 mt-1">+2.1%</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Failed Transactions</p>
                <p className="text-2xl font-bold text-foreground">${stats.failedTransactions.toLocaleString()}</p>
                <p className="text-sm text-red-600 mt-1">-5.2%</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-foreground">{stats.successRate.toFixed(1)}%</p>
                <p className="text-sm text-green-600 mt-1">+1.1%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center justify-between mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Filters</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Payment Method</label>
                    <Select value={methodFilter} onValueChange={setMethodFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Payment Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        <SelectItem value="credit">Credit Card</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setStatusFilter('all');
                      setMethodFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Transactions Table */}
          {fetchLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Transaction ID</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Guest</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Room</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Method</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-muted/50">
                      <td className="py-4 px-4 font-mono text-sm">
                        {payment.transaction_id || payment.id.slice(0, 8)}
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">
                            {payment.booking?.guest?.first_name} {payment.booking?.guest?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">Room booking payment</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium">
                        {payment.booking?.room?.room_number || 'N/A'}
                      </td>
                      <td className="py-4 px-4 font-semibold">${payment.amount}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(payment.payment_method)}
                          <span className="text-sm">{payment.payment_method}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusBadge(payment.payment_status)}>
                          {payment.payment_status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};