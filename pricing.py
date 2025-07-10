from fastapi import APIRouter
from data_access import get_inventory_items
from datetime import datetime, timedelta

router = APIRouter()

DISCOUNT_OVERSTOCK = 0.2  # 20% off
DISCOUNT_EXPIRY = 0.3     # 30% off
PRICE_INCREASE = 0.15     # 15% up
LOW_STOCK_THRESHOLD = 5
HIGH_DEMAND_SCORE = 0.8
OVERSTOCK_THRESHOLD = 80
EXPIRY_DAYS = 3

def suggest_price_changes():
    now = datetime.now()
    suggestions = []
    for item in get_inventory_items():
        new_price = item['price']
        reason = None
        if item['quantity'] >= OVERSTOCK_THRESHOLD:
            new_price = round(item['price'] * (1 - DISCOUNT_OVERSTOCK), 2)
            reason = "Overstocked - discount applied"
        elif item['expiry_date'] <= now + timedelta(days=EXPIRY_DAYS):
            new_price = round(item['price'] * (1 - DISCOUNT_EXPIRY), 2)
            reason = "Expiring soon - discount applied"
        elif item['demand_score'] >= HIGH_DEMAND_SCORE and item['quantity'] <= LOW_STOCK_THRESHOLD:
            new_price = round(item['price'] * (1 + PRICE_INCREASE), 2)
            reason = "High demand & low stock - price increased"
        if reason:
            suggestions.append({
                "item_id": item['id'],
                "item_name": item['name'],
                "old_price": item['price'],
                "suggested_price": new_price,
                "reason": reason
            })
    return suggestions

@router.get("/suggest", summary="Suggest price changes for inventory items")
def suggest_prices():
    return {"suggestions": suggest_price_changes()}

@router.post("/apply", summary="Apply suggested price changes (simulated)")
def apply_prices():
    # In a real app, this would update the DB. Here, just return the suggestions.
    return {"applied": suggest_price_changes()} 