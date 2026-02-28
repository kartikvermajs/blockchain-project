import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { generateLicenseKey } from "../../../../utils/liscenceUtils";

// Load environment variables securely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!supabaseUrl || !supabaseServiceRoleKey || !keySecret) {
  throw new Error("Missing required environment variables.");
}

// Initialize Supabase client securely
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      userId,
    } = body;

    console.log("🔹 Received Payment Data:", body);

    // Validate request data
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !userId
    ) {
      console.error("Missing payment details:", {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        userId,
      });
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 }
      );
    }

    // Ensure keySecret is defined
    if (!keySecret) {
      console.error("Razorpay key secret is missing.");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    // Generate and verify HMAC SHA256 signature
    // const expectedSignature = crypto
    //   .createHmac("sha256", keySecret as string) // Type assertion ensures TypeScript treats it as a string
    //   .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    //   .digest("hex");

    // if (expectedSignature !== razorpay_signature) {
    //   console.error("Payment verification failed. Signatures do not match.");
    //   return NextResponse.json(
    //     { error: "Payment verification failed" },
    //     { status: 400 }
    //   );
    // }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    console.log(
      "🔍 Signatures:\nExpected:",
      generatedSignature,
      "\nReceived:",
      razorpay_signature
    );

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed: signature mismatch" },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (fetchError || !existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate unique license key
    let licenseKey;
    let isUnique = false;

    while (!isUnique) {
      licenseKey = generateLicenseKey();
      const { data: existingKey } = await supabase
        .from("license_keys")
        .select("id")
        .eq("license_key", licenseKey)
        .single();
      if (!existingKey) isUnique = true;
    }

    // Insert license key into Supabase (without activation/expiration)
    const { error: licenseInsertError } = await supabase
      .from("license_keys")
      .insert([
        {
          user_id: userId,
          order_id: razorpay_order_id,
          license_key: licenseKey,
          activation_date: null,
          expiration_date: null,
        },
      ]);

    if (licenseInsertError) {
      console.error("License key insertion failed:", licenseInsertError);
      return NextResponse.json(
        { error: "License key insertion failed", details: licenseInsertError },
        { status: 500 }
      );
    }

    // Update user profile (mark as paid)
    const { error: userUpdateError } = await supabase
      .from("user_profiles")
      .update({ plan, is_paid: true })
      .eq("id", userId);

    if (userUpdateError) {
      console.error("User profile update failed:", userUpdateError);
      return NextResponse.json(
        { error: "User profile update failed", details: userUpdateError },
        { status: 500 }
      );
    }

    // Call blockchain API to activate the license key
    const blockchainResponse = await fetch(
      "https://blockchain-licenser-backend.onrender.com/api/key-manager/create-key",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: licenseKey,
        }),
      }
    );

    if (!blockchainResponse.ok) {
      const errText = await blockchainResponse.text();
      console.error("Blockchain key creation failed:", errText);
      return NextResponse.json(
        { error: "Blockchain key activation failed", details: errText },
        { status: 500 }
      );
    }

    const blockchainData = await blockchainResponse.json();
    const { activation_date, expiration_date } = blockchainData.data;

    console.log("✅ Payment verified, license saved, blockchain activated.");
    return NextResponse.json({
      success: true,
      license_key: licenseKey,
      activation_date,
      expiration_date,
    });
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
}
