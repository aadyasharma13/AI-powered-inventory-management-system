import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  expiry_date: Date;
  price: number;
  demand_score: number; // Placeholder
}

export function getInventoryItems(): InventoryItem[] {
  const csvPath = path.join(process.cwd(), 'src', 'utils', 'inventory.csv');
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  // Map to keep only the latest entry for each product_id
  const latestMap: Record<string, any> = {};
  for (const row of records) {
    const productId = row['product_id'];
    const timestamp = new Date(row['timestamp']);
    if (!latestMap[productId] || timestamp > new Date(latestMap[productId]['timestamp'])) {
      latestMap[productId] = row;
    }
  }

  return Object.values(latestMap).map((row: any) => ({
    id: row['product_id'],
    name: row['product_name'],
    quantity: parseInt(row['stock_level'], 10),
    expiry_date: new Date(row['expiry_date']),
    price: parseFloat(row['price']),
    demand_score: 0.5, // Placeholder
  }));
} 