"use client";
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { AnalyticsData } from '@/lib/types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c'];

export default function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(setData)
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-4 space-y-6">
      <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 space-y-2 border rounded-lg">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
        <div className="p-4 border rounded-lg">
          <div className="h-6 w-40 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="h-[200px] bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-2" />
            <div className="h-[200px] bg-gray-200 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  );
  if (error) return <div>{error}</div>;
  if (!data) return <div>No analytics data.</div>;

  // Prepare weather data for PieChart
  const weatherPieData = Object.entries(data.weatherStats).map(([weather, count]) => ({ name: weather, value: count }));

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Sales Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 space-y-1">
          <div>Total Sales: <b>{data.totalSales}</b></div>
          <div>Total Products: <b>{data.totalProducts}</b></div>
          <div>Most Sold Product: <b>{data.mostSoldProduct}</b></div>
          <div>Most In Stock: <b>{data.mostStockProduct}</b></div>
          <div>Expiring Soon: <b>{data.expiringSoon}</b></div>
        </Card>
        <Card className="p-4">
          <div className="mb-2">Weather Distribution:</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={weatherPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {weatherPieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="mb-2">Weekly Sales</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.salesByWeek} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4">
          <div className="mb-2">Monthly Sales</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.salesByMonth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4">
          <div className="mb-2">Yearly Sales</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.salesByYear} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4">
          <div className="mb-2">Product Sales Ranking</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.productSales} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="product" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="sales" fill="#ff8042" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4">
          <div className="mb-2">Product Stock Ranking</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.productStock} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="product" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="stock" fill="#a4de6c" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
