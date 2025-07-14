"use client";
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModelType, WeatherType, DemandResult, AlertResult } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Label } from '../ui/label';

export default function DemandForecastClient() {
  // Demand prediction form
  const [model, setModel] = useState<ModelType>('Random Forest');
  const [price, setPrice] = useState('');
  const [weather, setWeather] = useState<WeatherType>('Clear');
  const [demandResult, setDemandResult] = useState<DemandResult | null>(null);
  const [loadingDemand, setLoadingDemand] = useState(false);

  // Inventory alert form
  const [stock, setStock] = useState('');
  const [expiry, setExpiry] = useState('');
  const [alertResult, setAlertResult] = useState<AlertResult | null>(null);
  const [loadingAlert, setLoadingAlert] = useState(false);

  const handleDemand = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingDemand(true);
    setDemandResult(null);
    const res = await fetch('/api/demand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'predict', model, price: parseFloat(price), weather }),
    });
    const data = await res.json();
    setDemandResult(data);
    setLoadingDemand(false);
  };

  const handleAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAlert(true);
    setAlertResult(null);
    const res = await fetch('/api/demand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'alert', stock: parseInt(stock, 10), expiry }),
    });
    const data = await res.json();
    setAlertResult(data);
    setLoadingAlert(false);
  };

  // For demo: show a simple chart if demandResult exists
  const chartData = demandResult
    ? [
        { name: 'Today', value: parseFloat(price) },
        { name: 'Predicted', value: demandResult.predicted },
      ]
    : [];

  return (
    <div className="max-w-xl mx-auto p-4 space-y-8">
      <Card className="space-y-4 p-4">
        <h2 className="text-2xl font-bold mb-2">Demand Forecasting</h2>
        <form onSubmit={handleDemand} className="space-y-3">
          <div className="font-semibold">Predict Next Day Demand</div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={model} onValueChange={v => setModel(v as ModelType)} name="model">
              <SelectTrigger>
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Random Forest">Random Forest</SelectItem>
                <SelectItem value="Previous Day Sales">Previous Day Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input id="price" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weather">Weather</Label>
            <Select value={weather} onValueChange={v => setWeather(v as WeatherType)} name="weather">
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
          <Button type="submit" disabled={loadingDemand}>{loadingDemand ? 'Predicting...' : 'Predict'}</Button>
        </form>
        {demandResult && (
          <div className="mt-2">
            <div className="mb-2">📦 Predicted Demand: <b>{demandResult.predicted}</b> units</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
      <Card className="space-y-4 p-4">
        <form onSubmit={handleAlert} className="space-y-3">
          <div className="font-semibold">⚠️ Inventory Alert Checker</div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock Level</Label>
            <Input id="stock" type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="Current Stock Level" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input id="expiry" type="date" value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="Expiry Date" required />
          </div>
          <Button type="submit" disabled={loadingAlert}>{loadingAlert ? 'Checking...' : 'Check Alert'}</Button>
        </form>
        {alertResult && <div className="mt-2">{alertResult.alert}</div>}
      </Card>
    </div>
  );
}
