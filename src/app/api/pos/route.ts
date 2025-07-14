import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dataPoints } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Insert into dataPoints table
    await db.insert(dataPoints).values({
      ...body,
      timestamp: new Date(body.timestamp),
      expiry_date: new Date(body.expiry_date),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
