"use client";
import React, { useState } from 'react';
import { PosFormData, WeatherType } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '../ui/label';

const initialData: PosFormData = {
  product_id: '',
  product_name: '',
  timestamp: '',
  quantity_sold: '',
  stock_level: '',
  price: '',
  expiry_date: '',
  weather: 'Clear',
};

function getRandomProductName(): string {
  const products = ['Tomatoes', 'Milk', 'Bread', 'Eggs', 'Chicken', 'Rice', 'Pasta', 'Apples', 'Bananas', 'Oranges', 'Potatoes', 'Carrots', 'Onions', 'Cheese', 'Yogurt'];
  return products[Math.floor(Math.random() * products.length)];
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomWeather(): WeatherType {
  const weathers: WeatherType[] = ['Clear', 'Rain', 'Cloudy', 'Sunny', 'Storm', 'Snow'];
  return weathers[getRandomInt(0, weathers.length - 1)];
}

export default function PosClient() {
  const [form, setForm] = useState<PosFormData>({ ...initialData });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleWeatherChange = (value: WeatherType) => {
    setForm(prev => ({ ...prev, weather: value }));
  };

  const handleRandom = () => {
    const now = new Date();
    setForm({
      product_id: `prod-${getRandomInt(1, 10)}`,
      product_name: getRandomProductName(),
      timestamp: now.toISOString(),
      quantity_sold: getRandomInt(1, 100).toString(),
      stock_level: getRandomInt(0, 500).toString(),
      price: (Math.random() * 100).toFixed(2),
      expiry_date: new Date(now.getTime() + getRandomInt(1, 365) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      weather: getRandomWeather(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const payload = {
        product_id: `prod-${getRandomInt(1, 10)}`,
        product_name: form.product_name,
        timestamp: new Date(form.timestamp || new Date()).toISOString(),
        quantity_sold: parseInt(form.quantity_sold, 10),
        stock_level: parseInt(form.stock_level, 10),
        price: parseFloat(form.price),
        expiry_date: form.expiry_date,
        weather: form.weather,
      };
      const res = await fetch('/api/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMessage('Data uploaded successfully!');
      } else {
        setMessage('Failed to upload data.');
      }
    } catch (err: unknown) {
      setMessage('Error uploading data. ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold mb-2">Data Collection</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="product_name">Product Name</Label>
            <Input id="product_name" name="product_name" value={form.product_name} onChange={handleChange} placeholder="Product Name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity_sold">Quantity Sold</Label>
            <Input id="quantity_sold" name="quantity_sold" type="number" value={form.quantity_sold} onChange={handleChange} placeholder="Quantity Sold" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock_level">Stock Level</Label>
            <Input id="stock_level" name="stock_level" type="number" value={form.stock_level} onChange={handleChange} placeholder="Stock Level" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input id="price" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} placeholder="Price" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiry_date">Expiry Date</Label>
            <Input id="expiry_date" name="expiry_date" type="date" value={form.expiry_date} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weather">Weather</Label>
            <Select value={form.weather} onValueChange={handleWeatherChange} name="weather">
              <SelectTrigger>
                <SelectValue placeholder="Weather" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Clear">Clear</SelectItem>
                <SelectItem value="Rain">Rain</SelectItem>
                <SelectItem value="Cloudy">Cloudy</SelectItem>
                <SelectItem value="Sunny">Sunny</SelectItem>
                <SelectItem value="Storm">Storm</SelectItem>
                <SelectItem value="Snow">Snow</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleRandom}>Random Data</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</Button>
          </div>
        </form>
        {message && <div className="mt-2 text-center text-sm">{message}</div>}
      </Card>
    </div>
  );
}
