import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Load environment variables securely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables.");
}

// Initialize Supabase client securely
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Generate a random license key in XXXX-XXXX-XXXX-XXXX format.
 * @returns {string} License Key
 */
export function generateLicenseKey(): string {
  return [...Array(4)]
    .map(() => crypto.randomBytes(2).toString("hex").toUpperCase().slice(0, 4))
    .join("-");
}

/**
 * Activate the user's license in the database.
 * @param userId User's unique ID
 * @param duration Duration in years
 * @returns Updated license details
 */
export async function activateLicense(userId: string, duration: number = 1) {
  const licenseKey = generateLicenseKey();
  const activationDate = new Date().toISOString();
  const expirationDate = new Date(
    Date.now() + duration * 365 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("user_profiles")
    .update({
      license_key: licenseKey,
      activation_date: activationDate,
      expiration_date: expirationDate,
    })
    .eq("id", userId)
    .select("license_key, activation_date, expiration_date")
    .single();

  if (error) {
    console.error("❌ Error activating license:", error);
    return null;
  }

  return data;
}
