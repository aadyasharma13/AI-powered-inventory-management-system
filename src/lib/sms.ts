import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const from = process.env.TWILIO_PHONE_NUMBER!;
const to = process.env.ALERT_RECIPIENT_NUMBER!;

const client = twilio(accountSid, authToken);

export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    expiry_date: Date;
    price: number;
    demand_score: number; // Placeholder
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
    try {
        // Determine the base URL for API calls
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                       (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
        
        // Fetch inventory data from the API
        const response = await fetch(`${baseUrl}/api/inventory`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch inventory data');
        }

        return result.data || [];
    } catch (error) {
        console.error('Error fetching inventory data:', error);
        
        // Fallback: return mock data if API is unavailable
        return getFallbackInventoryData();
    }
}

// Fallback inventory data for when API is unavailable
function getFallbackInventoryData(): InventoryItem[] {
    console.warn('Using fallback inventory data - API unavailable');
    return [
        {
            id: 'P001',
            name: 'Fresh Tomatoes',
            quantity: 5,
            expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            price: 25.50,
            demand_score: 0.8
        },
        {
            id: 'P002',
            name: 'Organic Milk',
            quantity: 15,
            expiry_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
            price: 85.00,
            demand_score: 0.9
        },
        {
            id: 'P003',
            name: 'Whole Wheat Bread',
            quantity: 250,
            expiry_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
            price: 45.00,
            demand_score: 0.7
        }
    ];
}

export async function sendSmsAlert(message: string) {
    if (!accountSid || !authToken || !from || !to) {
        console.warn('Twilio environment variables are not set.');
        return;
    }
    try {
        const result = await client.messages.create({
            body: message,
            from,
            to,
        });
        return result.sid;
    } catch (err) {
        console.error('Failed to send SMS:', err);
        throw err;
    }
}