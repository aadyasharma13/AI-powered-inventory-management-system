import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dataPoints } from '@/db/schema';
import { sendSmsAlert } from '@/lib/sms';

// Mock Twilio send
async function sendTwilioSMS(product_id: string, alertType: string) {
  // Fetch product details for a better message
  const product = await db.query.dataPoints.findFirst({
    where: (d, { eq }) => eq(d.product_id, product_id),
  });

  const productName = product?.product_name || product_id;
  const message = `ALERT: ${alertType} for product "${productName}" (ID: ${product_id}). Please take action.`;

  // Send SMS using Twilio
  await sendSmsAlert(message);
  return true;
}

export async function GET() {
  try {
    const all = await db.select().from(dataPoints);
    const now = new Date();
    const alerts = all.filter(d => d.stock_level < 10 || new Date(d.expiry_date) < now).map(d => ({
      id: d.id,
      product_id: d.product_id,
      product_name: d.product_name,
      stock_level: d.stock_level,
      expiry_date: d.expiry_date,
      alertType: d.stock_level < 10 && new Date(d.expiry_date) < now ? 'Low Stock & Expired' : d.stock_level < 10 ? 'Low Stock' : 'Expired',
    }));
    return NextResponse.json(alerts);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await sendTwilioSMS(body.product_id, body.alertType);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
