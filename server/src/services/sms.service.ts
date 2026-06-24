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

/**
 * Truncate a message to fit within a single SMS segment (160 chars).
 * Appends "…" if truncated to keep messages concise and deliverable.
 */
const truncateSmsMessage = (message: string, maxLength = 157): string => {
  if (message.length <= maxLength) return message;
  return message.slice(0, maxLength) + "…";
};

export const sendSmsNotification = async (toNumber: string, message: string): Promise<boolean> => {
  const normalizedTo = normalizePhoneNumber(toNumber);
  const body = truncateSmsMessage(message);

  if (isTwilioConfigured && client) {
    try {
      await client.messages.create({
        body: body,
        from: fromNumber,
        to: normalizedTo,
      });
      console.log(`📱 [Twilio SMS] Successfully sent notification to ${normalizedTo}`);
      return true;
    } catch (error: any) {
      const twilioCode = error.code;
      let hint = "";

      // Twilio error 21608: Unverified destination on a Trial account
      if (twilioCode === 21608) {
        hint =
          "\n  ⚠️  TWILIO TRIAL ACCOUNT RESTRICTION: SMS can only be sent to phone numbers " +
          "that you have manually verified in the Twilio console.\n" +
          `  → The number "${normalizedTo}" is NOT verified.\n` +
          "  → Fix: Go to https://console.twilio.com/us1/develop/phone-numbers/manage/verified\n" +
          "    and add + verify the recipient's phone number, OR upgrade to a paid Twilio account.";
      }

      console.error(
        `❌ [Twilio SMS] Failed to send SMS to ${normalizedTo}. ` +
        `Twilio Error Code: ${twilioCode || "N/A"}, Message: ${error.message}${hint}`
      );
      return false;
    }
  }

  // Fallback / Mock behavior
  console.log("\n==================================================");
  console.log(`📱 [SMS NOTIFICATION MOCK]`);
  console.log(`To: ${normalizedTo}`);
  console.log(`Message: ${body}`);
  console.log(`Status: Twilio credentials not configured. Mock sent successfully.`);
  console.log("==================================================\n");
  return true;
};
