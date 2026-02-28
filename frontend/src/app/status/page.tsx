"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import { useRouter } from "next/navigation";
import { StarsBackground } from "@/components/ui/stars-background";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { CopyIcon, CheckIcon } from "lucide-react";

const supabase = createClient();

export default function StatusPage() {
  const [license, setLicense] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    fetchUserAndLicense();
  }, []);

  const fetchUserAndLicense = async () => {
    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      router.push("/login");
      return;
    }

    const { data: licenseData, error: licenseError } = await supabase
      .from("license_keys")
      .select("*")
      .eq("user_id", authData.user.id)
      .order("activation_date", { ascending: false })
      .limit(1)
      .single();

    if (!licenseError && licenseData) {
      setLicense(licenseData);
      if (licenseData.expiration_date) {
        updateTimeLeft(new Date(licenseData.expiration_date).getTime());
      }
    }

    setLoading(false);
  };

  const updateTimeLeft = (expiryTime: number) => {
    const now = new Date().getTime();
    const timeRemaining = expiryTime - now;
    setTimeLeft(timeRemaining > 0 ? timeRemaining : 0);
  };

  useEffect(() => {
    if (timeLeft === 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1000, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (ms: number) => {
    if (ms <= 0) return "0h 0m 0s";
    const sec = Math.floor(ms / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const getProgress = () => {
    if (!license) return 0;
    const start = new Date(license.activation_date).getTime();
    const end = new Date(license.expiration_date).getTime();
    const now = new Date().getTime();
    return Math.min(((now - start) / (end - start)) * 100, 100);
  };

  const handleCopy = () => {
    if (!license?.license_key) return;
    navigator.clipboard.writeText(license.license_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white px-6 py-12 font-mono relative">
      <StarsBackground className="absolute inset-0 opacity-70 z-0" />
      <ShootingStars  />
      <h1 className="text-4xl font-bold text-center mb-10 text-green-400 relative z-10">
        License Status
      </h1>

      <div className="max-w-xl mx-auto relative z-10">
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : license ? (
          <div className="bg-white/5 p-6 rounded-md shadow-md text-white text-center relative z-10">
            <div className="flex flex-col items-center gap-3">
              <p className="text-lg flex items-center justify-center gap-2">
                <strong>Key:</strong>
                <span className="select-all font-mono">
                  {license.license_key}
                </span>
                <span
                  onClick={handleCopy}
                  className="cursor-pointer hover:text-green-400 transition"
                >
                  {copied ? (
                    <CheckIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <CopyIcon className="w-5 h-5" />
                  )}
                </span>
              </p>

              <p>
                <strong>Time Left:</strong> {formatTime(timeLeft)}
              </p>
            </div>

            <div className="mt-4 w-full bg-white/20 h-4 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-1000"
                style={{ width: `${getProgress()}%` }}
              />
            </div>

            <p
              className={`mt-4 font-semibold ${
                getProgress() >= 100 ? "text-red-500" : "text-green-400"
              }`}
            >
              {getProgress() >= 100
                ? "❌ License Expired"
                : "✅ License Active"}
            </p>
          </div>
        ) : (
          <p className="text-center text-red-400 font-semibold mt-10">
            🚫 Activate your license first
          </p>
        )}
      </div>
    </div>
  );
}
