from fastapi import APIRouter
from data_access import get_inventory_items
from datetime import datetime, timedelta
from twilio.rest import Client
import os

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
ALERT_RECIPIENT_NUMBER = os.getenv("ALERT_RECIPIENT_NUMBER")

router = APIRouter()

ALERT_THRESHOLD_LOW = 5
ALERT_THRESHOLD_OVERSTOCK = 80
ALERT_EXPIRY_DAYS = 3

def send_sms_alert(alert: dict):
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    message_body = f"{alert['type']} alert for {alert['item_name']}: {alert['reason']} at {alert['timestamp']}"
    message = client.messages.create(
        body=message_body,
        from_=TWILIO_PHONE_NUMBER,
        to=ALERT_RECIPIENT_NUMBER
    )
    print(f"Sent SMS: {message.sid}")


def send_email_alert(alert: dict):
    # Placeholder for SendGrid integration
    # Example: Use SendGridAPIClient(api_key) to send email
    print(f"[SendGrid Email] To: <recipient_email> | Subject: {alert['type']} alert for {alert['item_name']} | Body: {alert['reason']} at {alert['timestamp']}")

def send_api_alert(item, reason):
    print(f"[API] Alert for {item['name']}: {reason}")

def check_alerts():
    alerts = []
    now = datetime.now()
    for item in get_inventory_items():
        # Low stock
        if item['quantity'] < 10:
            alert = {
                "type": "Low Stock",
                "item_name": item['name'],
                "reason": f"Only {item['quantity']} left in stock.",
                "timestamp": now.isoformat()
            }
            alerts.append(alert)
            send_sms_alert(alert)
            send_email_alert(alert)
        # Expiring soon
        if item['expiry_date'] <= now + timedelta(days=3):
            alert = {
                "type": "Expiring Soon",
                "item_name": item['name'],
                "reason": f"Expires on {item['expiry_date'].date()}",
                "timestamp": now.isoformat()
            }
            alerts.append(alert)
            send_sms_alert(alert)
            send_email_alert(alert)
        # Overstocked
        if item['quantity'] > 200:
            alert = {
                "type": "Overstocked",
                "item_name": item['name'],
                "reason": f"{item['quantity']} in stock.",
                "timestamp": now.isoformat()
            }
            alerts.append(alert)
            send_sms_alert(alert)
            send_email_alert(alert)
    return alerts

@router.get("/trigger", summary="Trigger inventory alerts")
def trigger_alerts():
    alerts = check_alerts()
    return {"alerts": alerts}

@router.get("/list", summary="List current alerts")
def list_alerts():
    return {"alerts": check_alerts()} 