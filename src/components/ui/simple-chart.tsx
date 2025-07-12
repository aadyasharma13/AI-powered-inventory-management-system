'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SimpleChartProps {
  title: string;
  description?: string;
  data: Array<{ label: string; value: number; color?: string }>;
  type?: 'bar' | 'line' | 'pie' | 'doughnut';
  height?: number;
}

export function SimpleChart({ title, description, data, type = 'bar', height = 300 }: SimpleChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4" style={{ height }}>
          {type === 'bar' && (
            <div className="space-y-2">
              {data.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: item.color || '#3b82f6'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {type === 'line' && (
            <div className="space-y-2">
              {data.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color || '#3b82f6' }} />
                  <span className="text-sm">{item.label}</span>
                  <span className="text-sm font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          )}
          
          {type === 'pie' && (
            <div className="grid grid-cols-2 gap-4">
              {data.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || '#3b82f6' }} />
                  <span className="text-sm">{item.label}</span>
                  <span className="text-sm font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          )}
          
          {type === 'doughnut' && (
            <div className="space-y-2">
              {data.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || '#3b82f6' }} />
                  <span className="text-sm">{item.label}</span>
                  <span className="text-sm font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 