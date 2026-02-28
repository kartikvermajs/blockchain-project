import LogoIcon from "@/assets/logo.svg";
import MenuIcon from "@/assets/icon-menu.svg";
import { Button } from "@/components/Button";
import Link from "next/link";
import { createClient } from "../../utils/supabase/server";
import NavAvatar from "@/components/NavAvatar";

export const Header = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="py-4 border-b border-white/15 md:border-none sticky top-0 z-50">
      <div className="container">
        <div className="flex justify-between items-center md:border border-white/15 md:p-2.5 rounded-xl max-w-2xl mx-auto backdrop-blur-md shadow-2xl">
          <div>
            <div className="border h-10 w-10 rounded-lg inline-flex justify-center items-center border-white/15">
              <Link href="/">
                <LogoIcon className="h-8 w-8 cursor-pointer" />
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <nav className="flex gap-8 text-sm">
              <a href="/activate" className="text-white/70 hover:text-white transition">
                Activation
              </a>
              <a href="/status" className="text-white/70 hover:text-white transition">
                Status
              </a>
              <a href="/about" className="text-white/70 hover:text-white transition">
                About
              </a>
            </nav>
          </div>
          <div className="flex gap-4 items-center">
            {user ? (
              <NavAvatar />
            ) : (
              <>
                <Link href="/register">
                  <Button variant="magic">Sign Up</Button>
                </Link>
                <Link href="/login">
                  <Button variant="default">Login</Button>
                </Link>
              </>
            )}
            <MenuIcon className="md:hidden" />
          </div>
        </div>
      </div>
    </header>
  );
};