import { NextRequest, NextResponse } from 'next/server';
import { getInventoryItems } from '@/utils/dataAccess';
import { sendSmsAlert } from '@/utils/sms';

export async function GET(req: NextRequest) {
  const now = new Date();
  const alerts: Array<{
    type: string;
    item_name: string;
    reason: string;
    timestamp: string;
  }> = [];

  for (const item of getInventoryItems()) {
    // Low stock
    if (item.quantity < 10) {
      const alert = {
        type: 'Low Stock',
        item_name: item.name,
        reason: `Only ${item.quantity} left in stock.`,
        timestamp: now.toISOString(),
      };
      alerts.push(alert);
      await sendSmsAlert(`${alert.type} for ${alert.item_name}: ${alert.reason} at ${alert.timestamp}`);
    }
    // Expiring soon
    if (item.expiry_date <= new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)) {
      const alert = {
        type: 'Expiring Soon',
        item_name: item.name,
        reason: `Expires on ${item.expiry_date.toISOString().slice(0, 10)}`,
        timestamp: now.toISOString(),
      };
      alerts.push(alert);
      await sendSmsAlert(`${alert.type} for ${alert.item_name}: ${alert.reason} at ${alert.timestamp}`);
    }
    // Overstocked
    if (item.quantity > 200) {
      const alert = {
        type: 'Overstocked',
        item_name: item.name,
        reason: `${item.quantity} in stock.`,
        timestamp: now.toISOString(),
      };
      alerts.push(alert);
      await sendSmsAlert(`${alert.type} for ${alert.item_name}: ${alert.reason} at ${alert.timestamp}`);
    }
  }

  return NextResponse.json({ alerts });
} 