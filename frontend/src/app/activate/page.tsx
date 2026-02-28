"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import { createClient } from "../../../utils/supabase/client";

const supabase = createClient();

export default function ActivatePage() {
  const [activationKey, setActivationKey] = useState("");
  const [status, setStatus] = useState<
    "initial" | "active" | "expired" | "error"
  >("initial");
  const [activationDate, setActivationDate] = useState<Date | null>(null);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    fetchLicenseStatus();
  }, []);

  useEffect(() => {
    if (status === "active" && expirationDate) {
      const interval = setInterval(() => {
        if (new Date() > expirationDate) {
          setStatus("expired");
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status, expirationDate]);

  const fetchLicenseStatus = async () => {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) return;

    const { data: licenseData } = await supabase
      .from("license_keys")
      .select("*")
      .eq("user_id", authData.user.id)
      .order("activation_date", { ascending: false })
      .limit(1)
      .single();

    if (licenseData?.activation_date && licenseData?.expiration_date) {
      const activationDateObj = new Date(licenseData.activation_date);
      const expirationDateObj = new Date(licenseData.expiration_date);
      setActivationDate(activationDateObj);
      setExpirationDate(expirationDateObj);
      setActivationKey(licenseData.license_key || "");

      const now = new Date();
      if (now > expirationDateObj) {
        setStatus("expired");
      } else {
        setStatus("active");
      }
    }
  };

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User not authenticated:", userError);
        setStatus("error");
        return;
      }

      const userId = user.id;

      const { data: licenseRecord, error: licenseError } = await supabase
        .from("license_keys")
        .select("*")
        .eq("license_key", activationKey)
        .eq("user_id", userId)
        .maybeSingle();

      if (licenseError || !licenseRecord) {
        console.error("License validation failed:", licenseError);
        setStatus("error");
        return;
      }

      const response = await fetch(
        "https://blockchain-licenser-backend.onrender.com/api/key-manager/activate-key",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: activationKey }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const { activation_date, expiration_date } = json.data;

        const activationDateObj = new Date(activation_date * 1000);
        const expirationDateObj = new Date(expiration_date * 1000);

        if (
          isNaN(activationDateObj.getTime()) ||
          isNaN(expirationDateObj.getTime())
        ) {
          throw new Error("Invalid activation or expiration date received");
        }

        setActivationDate(activationDateObj);
        setExpirationDate(expirationDateObj);
        setStatus("active");

        const { error: updateError } = await supabase
          .from("license_keys")
          .update({
            activation_date: activationDateObj.toISOString(),
            expiration_date: expirationDateObj.toISOString(),
          })
          .eq("license_key", activationKey);

        if (updateError) {
          console.error("Failed to update activation info:", updateError);
        }
      } else {
        const err = await response.json();
        console.error("Activation API error:", err);
        setStatus("error");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setStatus("error");
    } finally {
      setIsActivating(false);
    }
  };

  const renderStatusMessage = () => {
    switch (status) {
      case "initial":
        return "Activate your license first";
      case "active":
        return "License Active";
      case "expired":
        return "License Expired";
      case "error":
        return "Activation failed. Try again.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-indigo-900 to-black text-white px-6 py-12 font-mono">
      <StarsBackground className="absolute inset-0 opacity-70" />
      <ShootingStars />
      <h1 className="text-4xl font-bold text-center mb-10 text-purple-400">
        Activate Your Antivirus License
      </h1>

      <div className="max-w-md mx-auto">
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <h2 className="text-xl font-bold text-white text-center">
              {renderStatusMessage()}
            </h2>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className="mb-4 bg-black/30 text-white placeholder:text-white/50 border-white/20"
              value={activationKey}
              onChange={(e) => setActivationKey(e.target.value)}
            />
            <Button
              onClick={handleActivate}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center"
              disabled={
                status === "active" || status === "expired" || isActivating
              }
            >
              {isActivating ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  Activating...
                </>
              ) : (
                "Activate"
              )}
            </Button>

            {activationDate && expirationDate && (
              <div className="text-sm mt-4 text-center">
                <p>Activated: {activationDate.toLocaleString()}</p>
                <p>Expires: {expirationDate.toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
