
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, DollarSign, CreditCard, Receipt } from 'lucide-react';

export const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const paymentStats = [
    { title: 'Total Revenue', amount: '$124,892', change: '+12.5%', color: 'text-green-600' },
    { title: 'Pending Payments', amount: '$8,450', change: '+2.1%', color: 'text-yellow-600' },
    { title: 'Failed Transactions', amount: '$1,290', change: '-5.2%', color: 'text-red-600' },
    { title: 'Successful Rate', amount: '96.8%', change: '+1.1%', color: 'text-blue-600' }
  ];

  const recentTransactions = [
    {
      id: '#10234',
      guest: 'Alice Johnson',
      room: '305A',
      amount: '$450.00',
      status: 'completed',
      method: 'Credit Card',
      date: '2024-01-15 14:32',
      description: 'Room booking payment'
    },
    {
      id: '#10235',
      guest: 'Bob Smith',
      room: '210B',
      amount: '$320.00',
      status: 'pending',
      method: 'Bank Transfer',
      date: '2024-01-15 13:45',
      description: 'Room booking payment'
    },
    {
      id: '#10236',
      guest: 'Carol Davis',
      room: '156C',
      amount: '$680.00',
      status: 'completed',
      method: 'Credit Card',
      date: '2024-01-15 12:20',
      description: 'Suite booking payment'
    },
    {
      id: '#10237',
      guest: 'David Wilson',
      room: '402A',
      amount: '$290.00',
      status: 'failed',
      method: 'Credit Card',
      date: '2024-01-15 11:15',
      description: 'Room booking payment'
    },
    {
      id: '#10238',
      guest: 'Emma Brown',
      room: '118B',
      amount: '$550.00',
      status: 'completed',
      method: 'PayPal',
      date: '2024-01-15 10:30',
      description: 'Deluxe room payment'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusColors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Credit Card':
        return <CreditCard className="w-4 h-4" />;
      case 'PayPal':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all payment transactions</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paymentStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.amount}</p>
                  <p className={`text-sm ${stat.color} mt-1`}>{stat.change}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="credit-card">Credit Card</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Transaction ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Guest</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Room</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Method</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4 font-mono text-sm">{transaction.id}</td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">{transaction.guest}</p>
                        <p className="text-sm text-gray-500">{transaction.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium">{transaction.room}</td>
                    <td className="py-4 px-4 font-semibold">{transaction.amount}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(transaction.method)}
                        <span className="text-sm">{transaction.method}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusBadge(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{transaction.date}</td>
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
        </CardContent>
      </Card>
    </div>
  );
};
