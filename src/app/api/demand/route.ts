import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.type === 'predict') {
      // Try to fetch from Railway API first
      try {
        const railwayResponse = await fetch('https://inventory-api-production-5b1f.up.railway.app/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prev_sales: body.prev_sales || 10,
            price: body.price || 30,
            weather: body.weather || 'Clear',
            model: body.model || 'Random Forest'
          })
        });

        if (railwayResponse.ok) {
          const railwayData = await railwayResponse.json();
          return NextResponse.json({ predicted: railwayData.predicted_demand });
        }
      } catch (railwayError) {
        console.log('Railway API failed, using fallback');
      }

      // Fallback to random data if Railway API fails
      const predicted = Math.max(0, 10 + (body.price ? 5 - body.price : 0) + (body.weather === 'Rain' ? -2 : 2) + Math.random() * 5);
      return NextResponse.json({ predicted: parseFloat(predicted.toFixed(2)) });
    } else if (body.type === 'alert') {
      const now = new Date();
      const expiry = new Date(body.expiry);
      let alert = '';
      if (body.stock < 10) alert += '⚠️ Low Stock ';
      if (expiry < now) alert += '| ⚠️ Expired';
      else if (expiry < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) alert += '| ⚠️ Expiring Soon';
      if (!alert) alert = '✅ All Good';
      return NextResponse.json({ alert: alert.trim() });
    }
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
