import SignUpForm from "@/components/SignUpForm";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import signupImage from "@/assets/signup-image.jpg";

const SignUp = async () => {
  return (
    <main className="flex min-h-[calc(100vh-96px)] items-center justify-center">
      <div className="flex w-full max-w-[64rem] overflow-hidden rounded-2xl shadow-2xl bg-secondary-foreground">
        {/* Left Side: Form */}
        <div className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2">
          <h1 className="text-center text-3xl font-bold">Register Here</h1>

          <div className="space-y-5">
            <SignUpForm />

            {/* Links */}
            <Link href="/login" className="block text-center hover:underline">
              Already have an account? Log In
            </Link>
          </div>
        </div>

        {/* Right Side: Image */}
        <Image
          src={signupImage}
          alt="Login Illustration"
          className="hidden w-1/2 object-cover md:block"
        />
      </div>
    </main>
  );
};

export default SignUp;
