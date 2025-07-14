import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Predict endpoint
    if (body.type === 'predict') {
      try {
        const railwayResponse = await fetch('https://inventory-api-production-5b1f.up.railway.app/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prev_sales: body.prev_sales || 0,
            price: body.price || 0,
            weather: body.weather || 'Clear',
            model: body.model || 'RandomForest'
          })
        });

        if (railwayResponse.ok) {
          const railwayData = await railwayResponse.json();
          return NextResponse.json(railwayData);
        }
      } catch (railwayError: unknown) {
        console.log('Railway API failed, using fallback', railwayError instanceof Error ? railwayError.message : railwayError);
      }

      // Fallback to random data if Railway API fails
      const predicted = Math.max(0, 10 + (body.price ? 5 - body.price : 0) + (body.weather === 'Rain' ? -2 : 2) + Math.random() * 5);
      return NextResponse.json(predicted.toFixed(2));
    } 
    
    // Alert endpoint
    else if (body.type === 'alert') {
      try {
        const railwayResponse = await fetch('https://inventory-api-production-5b1f.up.railway.app/alerts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            stock_level: body.stock_level || body.stock || 0,
            expiry_date: body.expiry_date || body.expiry || new Date().toISOString().split('T')[0]
          })
        });

        if (railwayResponse.ok) {
          const railwayData = await railwayResponse.json();
          return NextResponse.json(railwayData);
        }
      } catch (railwayError: unknown) {
        console.log('Railway alerts API failed, using fallback', railwayError instanceof Error ? railwayError.message : railwayError);
      }

      // Fallback logic for alerts
      const now = new Date();
      const expiry = new Date(body.expiry_date || body.expiry);
      const stockLevel = body.stock_level || body.stock || 0;
      
      let alert = '';
      if (stockLevel < 10) alert += '⚠️ Low Stock ';
      if (expiry < now) alert += '| ⚠️ Expired';
      else if (expiry < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) alert += '| ⚠️ Expiring Soon';
      if (!alert) alert = '✅ All Good';
      
      return NextResponse.json(alert.trim());
    }
    
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
