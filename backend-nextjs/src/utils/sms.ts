import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const from = process.env.TWILIO_PHONE_NUMBER!;
const to = process.env.ALERT_RECIPIENT_NUMBER!;

const client = twilio(accountSid, authToken);

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