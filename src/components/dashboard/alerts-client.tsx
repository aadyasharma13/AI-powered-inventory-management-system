"use client";
import React, { useEffect, useState } from 'react';
import { AlertProduct } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AlertsClient() {
  const [products, setProducts] = useState<AlertProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/alerts')
      .then(res => res.json())
      .then(setProducts)
      .catch(() => setMessage('Failed to load alerts'))
      .finally(() => setLoading(false));
  }, []);

  const sendAlert = async (product: AlertProduct) => {
    setMessage('');
    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: product.product_id, alertType: product.alertType }),
    });
    if (res.ok) setMessage('Alert sent!');
    else setMessage('Failed to send alert.');
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="p-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-4" />
        <div className="space-y-2">
          <div className="flex items-center space-x-4 border-b pb-2">
            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Inventory Alerts</h2>
        {message && <div className="mb-2 text-sm text-center">{message}</div>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Alert</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.product_name}</TableCell>
                <TableCell>{p.stock_level}</TableCell>
                <TableCell>{p.expiry_date}</TableCell>
                <TableCell>{p.alertType}</TableCell>
                <TableCell><Button size="sm" onClick={() => sendAlert(p)}>Send Alert</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
