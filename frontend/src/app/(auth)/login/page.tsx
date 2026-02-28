import LoginForm from "@/components/LoginForm";
import LoginGithub from "@/components/LoginGithub";
import Link from "next/link";
import loginImage from "@/assets/login-image.jpg";
import Image from "next/image";
import { Metadata } from "next";
import LoginGoogle from "@/components/LoginGoogle";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-96px)] items-center justify-center p-5">
      <div className="flex w-full max-w-[64rem] overflow-hidden rounded-2xl shadow-2xl bg-secondary-foreground">
        {/* Left Side: Form */}
        <div className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2">
          <h1 className="text-center text-3xl font-bold">Login Here</h1>

          <div className="space-y-5">
            {/* Login Form & GitHub Login */}
            <LoginForm />
            <LoginGithub />
            <LoginGoogle />

            {/* Links */}
            <Link
              href="/register"
              className="block text-center hover:underline"
            >
              Don&apos;t have an account? Sign up
            </Link>
            <Link
              href="/forgot-password"
              className="block text-center hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        {/* Right Side: Image */}
        <Image
          src={loginImage}
          alt="Login Illustration"
          className="hidden w-1/2 object-cover md:block"
        />
      </div>
    </main>
  );
}
