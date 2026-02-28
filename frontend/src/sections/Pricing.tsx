"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import { Inter } from "next/font/google";
import { createClient } from "../../utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const supabase = createClient();
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"] });

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const pricingTiers = [
  {
    title: "Plus",
    description: "Essential protection with AI-powered scanning.",
    price: 1.99,
    displayPrice: "₹1.99 / year",
    features: [
      "Real-time virus & malware scanning",
      "AI threat detection & removal",
      "Basic firewall protection",
      "Secure browsing mode",
    ],
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "Standard",
    description: "Advanced security with privacy protection.",
    price: 2.99,
    displayPrice: "₹2.99 / year",
    features: [
      "All Plus features included",
      "Advanced ransomware defense",
      "VPN for anonymous browsing",
      "Encrypted cloud backup (10GB)",
    ],
    color: "from-purple-500 to-fuchsia-600",
  },
  {
    title: "Ultimate",
    description: "Full-scale security with AI-driven defense.",
    price: 3.99,
    displayPrice: "₹3.99 / year",
    features: [
      "All Standard features included",
      "AI-driven threat prediction",
      "Dark web monitoring & alerts",
      "Unlimited encrypted cloud backup",
      "24/7 premium support",
    ],
    color: "from-teal-500 to-cyan-500",
  },
];

export const Pricing = () => {
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyingPlan, setVerifyingPlan] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      } else if (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
  }, []);

  const verifyPayment = async (
    razorpay_payment_id: string,
    razorpay_order_id: string,
    razorpay_signature: string,
    plan: string
  ) => {
    try {
      setIsVerifying(true);
      setVerifyingPlan(plan);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
          plan,
          userId,
        }),
      });

      const data = await response.json();
      setIsVerifying(false);

      if (!response.ok) {
        throw new Error(data.error || "Payment verification failed");
      }

      alert(`Payment for ${plan} plan verified successfully!`);
      // window.location.href = "/status";
      router.push("/status");
    } catch (error) {
      console.error("Payment verification failed", error);
      setIsVerifying(false);
      alert("Payment verification failed. Please contact support.");
    }
  };

  const handlePayment = async (amount: number, plan: string) => {
    if (!userId) {
      alert("You need to be logged in to purchase a plan.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("is_paid")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data?.is_paid) {
        alert("You have already purchased a plan. Redirecting to Orders...");
        router.push("/status");
        return;
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      alert("Error verifying your account. Please try again.");
      return;
    }

    if (!razorpayLoaded) {
      alert("Razorpay is still loading. Please wait...");
      return;
    }

    if (!window.Razorpay) {
      console.error("Razorpay SDK not loaded properly.");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) throw new Error("Failed to create order");

      const data = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: "INR",
        name: "Blockchain Project",
        description: `Purchase ${plan} Plan`,
        order_id: data.id,

        handler: async function (response: any) {
          alert(`Payment for ${plan} plan successful!`);

          setTimeout(() => {
            verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature,
              plan
            );
          }, 500);
        },

        modal: {
          ondismiss: function () {
            console.warn("🟥 Razorpay payment popup closed by user."); // ✅ [6] Debug log
          },
        },

        prefill: {
          name: "Kartik Verma",
          email: "kartikverma88272@gmail.com",
          contact: "9516950830",
        },
        theme: { color: "#3399cc" },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Payment failed", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Loader Overlay */}
      {isVerifying && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center text-white font-mono">
          <div className="text-lg mb-4 animate-pulse text-purple-300">
            Verifying your payment for{" "}
            <span className="font-bold">{verifyingPlan}</span>...
          </div>
          <svg
            className="animate-spin h-10 w-10 text-white"
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
          <p className="mt-4 text-sm text-gray-400">
            Do not refresh or close this page.
          </p>
        </div>
      )}

      <section
        className={`relative py-20 bg-black text-white overflow-hidden ${inter.className}`}
      >
        <StarsBackground className="absolute inset-0 opacity-40" />
        <ShootingStars className="absolute inset-0" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 leading-tight"
          >
            Choose Your Antivirus Plan
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-16">
            {pricingTiers.map((tier) => (
              <motion.div
                key={tier.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0px 0px 30px rgba(140, 69, 255, 0.8)",
                }}
                transition={{ duration: 0.3 }}
                className="relative rounded-3xl p-10 flex flex-col items-center text-center bg-[radial-gradient(100%_100%_at_top_left,rgba(255,255,255,0.1),rgba(140,69,255,0.3))] shadow-lg overflow-hidden"
              >
                <div className="absolute inset-0 rounded-3xl transition-all duration-300 ease-in-out hover:ring-2 hover:ring-purple-400 hover:ring-opacity-50"></div>

                <h3 className="text-3xl font-bold text-white">{tier.title}</h3>
                <p className="text-gray-300 text-lg mt-2">{tier.description}</p>

                <div className="text-4xl font-black my-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-500 drop-shadow-lg">
                  {tier.displayPrice}
                </div>

                <Button
                  onClick={() =>
                    userId && handlePayment(tier.price, tier.title)
                  }
                  disabled={isProcessing || !razorpayLoaded || !userId}
                  className="w-full mb-8 bg-white text-black font-semibold py-4 rounded-lg text-lg transition-transform transform hover:scale-105 hover:bg-opacity-90 disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Buy Now"}
                </Button>

                <ul className="text-gray-200 text-left space-y-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-lg"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Pricing;
