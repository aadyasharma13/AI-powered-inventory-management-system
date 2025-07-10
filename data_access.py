import pandas as pd
from datetime import datetime

def get_inventory_items():
    df = pd.read_csv("Retail Inventory Management.csv", parse_dates=["timestamp", "expiry_date"])
    # Sort by timestamp to get the latest entry for each product
    df = df.sort_values("timestamp")
    latest = df.groupby("product_id").tail(1)
    items = []
    for _, row in latest.iterrows():
        items.append({
            "id": row["product_id"],
            "name": row["product_name"],
            "quantity": int(row["stock_level"]),
            "expiry_date": row["expiry_date"],
            "price": float(row["price"]),
            "demand_score": 0.5  # Placeholder for now
        })
    return items 