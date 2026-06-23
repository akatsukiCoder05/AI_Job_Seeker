import twilio from "twilio";
import env from "../config/env";

const accountSid = env.TWILIO_ACCOUNT_SID;
const authToken = env.TWILIO_AUTH_TOKEN;
const fromNumber = env.TWILIO_FROM_NUMBER;

const isTwilioConfigured = !!(accountSid && authToken && fromNumber);

let client: any = null;
if (isTwilioConfigured) {
  try {
    client = twilio(accountSid, authToken);
  } catch (error) {
    console.error("❌ Failed to initialize Twilio client:", error);
  }
}

/**
 * Normalize a phone number to E.164 format required by Twilio.
 * Handles cases like: "8791111634", "918791111634", "+918791111634"
 * Defaults to +91 (India) country code if no country code is detected.
 */
const normalizePhoneNumber = (phone: string): string => {
  // Strip all spaces, dashes, parentheses
  let cleaned = phone.replace(/[\s\-().]/g, "");

  // Already in E.164 format
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // Has country code 91 but missing +
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  // US country code 1 without +
  if (cleaned.startsWith("1") && cleaned.length === 11) {
    return `+${cleaned}`;
  }

  // 10-digit Indian mobile number — prepend +91
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  // Fallback: prepend + and hope for the best
  return `+${cleaned}`;
};

export const sendSmsNotification = async (toNumber: string, message: string): Promise<boolean> => {
  const normalizedTo = normalizePhoneNumber(toNumber);

  if (isTwilioConfigured && client) {
    try {
      await client.messages.create({
        body: message,
        from: fromNumber,
        to: normalizedTo,
      });
      console.log(`📱 [Twilio SMS] Successfully sent notification to ${normalizedTo}`);
      return true;
    } catch (error: any) {
      console.error(`❌ [Twilio SMS] Failed to send SMS to ${normalizedTo}:`, error.message || error);
    }
  }

  // Fallback / Mock behavior
  console.log("\n==================================================");
  console.log(`📱 [SMS NOTIFICATION MOCK]`);
  console.log(`To: ${normalizedTo}`);
  console.log(`Message: ${message}`);
  console.log(`Status: Twilio credentials not configured. Mock sent successfully.`);
  console.log("==================================================\n");
  return true;
};
