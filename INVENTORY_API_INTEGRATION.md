# Inventory API Integration

This document explains how the inventory management system now fetches data from the database API instead of CSV files.

## Changes Made

### 1. New API Endpoint
- **File**: `src/app/api/inventory/route.ts`
- **Endpoint**: `GET /api/inventory`
- **Purpose**: Fetches current inventory data from the database

### 2. Updated SMS Service
- **File**: `src/lib/sms.ts`
- **Changes**:
  - Removed CSV file reading logic
  - Added API-based data fetching
  - Made `getInventoryItems()` async
  - Added fallback mechanism for API failures
  - Enhanced error handling with timeouts

### 3. Updated Alert Manager
- **File**: `src/app/api/agents/alert-manager/route.ts`
- **Changes**:
  - Updated to use async `getInventoryItems()`
  - Both `generateInventoryAlerts()` and `checkAndSendRealTimeAlerts()` now use database API

## API Response Format

The `/api/inventory` endpoint returns:

```json
{
  "success": true,
  "data": [
    {
      "id": "P001",
      "name": "Fresh Tomatoes",
      "quantity": 25,
      "expiry_date": "2024-01-08T00:00:00.000Z",
      "price": 422.23,
      "demand_score": 0.5
    }
  ],
  "count": 1,
  "lastUpdate": "2024-01-01T12:00:00.000Z"
}
```

## Environment Variables

Add these to your `.env.local` file:

```env
# Base URL for API calls (optional, defaults to localhost:3000 in development)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Twilio Configuration for SMS Alerts
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
ALERT_RECIPIENT_NUMBER=recipient-phone-number-for-alerts
```

## How It Works

1. **Data Source**: The system now fetches inventory data from the database via the `/api/inventory` endpoint
2. **Real-time Updates**: Data is fetched fresh each time alerts are checked
3. **Fallback**: If the API is unavailable, the system uses mock data to prevent failures
4. **Error Handling**: Comprehensive error handling with timeouts and logging

## Usage

### Checking Alerts
```bash
# Get standard alerts
GET /api/agents/alert-manager

# Get real-time alerts with SMS notifications
GET /api/agents/alert-manager?realtime=true

# Generate inventory alerts from database
PUT /api/agents/alert-manager
```

### SMS Alerts
SMS alerts are automatically sent when:
- Stock level falls below 10 units
- Items expire within 3 days
- Stock exceeds 200 units

## Benefits

1. **Real-time Data**: Always uses the latest inventory data from the database
2. **Scalability**: No file system dependencies
3. **Reliability**: Fallback mechanism ensures system continues working
4. **Performance**: Efficient database queries with proper indexing
5. **Consistency**: Single source of truth for inventory data
