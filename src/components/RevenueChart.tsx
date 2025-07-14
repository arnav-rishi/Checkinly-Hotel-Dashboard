
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useApi } from '@/hooks/useApi';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay } from 'date-fns';

interface RevenueData {
  date: string;
  revenue: number;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
};

export const RevenueChart = () => {
  const [data, setData] = useState<RevenueData[]>([]);
  const { execute: fetchData, loading } = useApi();

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      const result = await fetchData(async () => {
        const { data, error } = await supabase
          .from('payments')
          .select('amount, paid_at')
          .eq('payment_status', 'completed')
          .not('paid_at', 'is', null);
        
        if (error) throw error;
        return data;
      });

      if (result) {
        // Group payments by day for the last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = startOfDay(subDays(new Date(), 6 - i));
          return format(date, 'yyyy-MM-dd');
        });

        const revenueByDay = last7Days.map(dateStr => {
          const dayRevenue = result
            .filter(payment => {
              if (!payment.paid_at) return false;
              const paymentDate = format(new Date(payment.paid_at), 'yyyy-MM-dd');
              return paymentDate === dateStr;
            })
            .reduce((sum, payment) => sum + Number(payment.amount), 0);

          return {
            date: format(new Date(dateStr), 'MMM dd'),
            revenue: dayRevenue,
          };
        });

        setData(revenueByDay);
      }
    } catch (error) {
      console.error('Error loading revenue data:', error);
    }
  };

  if (loading) {
    return <div className="h-64 animate-pulse bg-muted rounded"></div>;
  }

  return (
    <ChartContainer config={chartConfig} className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <ChartTooltip 
            content={<ChartTooltipContent />}
            formatter={(value) => [`$${value}`, 'Revenue']}
          />
          <Bar dataKey="revenue" fill="var(--color-revenue)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
