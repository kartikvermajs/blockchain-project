import React from "react";
import Logo from "@/assets/logo.svg";
import InstaSocial from "@/assets/social-instagram.svg";
import XSocial from "@/assets/social-x.svg";

const Footer = () => {
  return (
    <footer className="py-5 border-t border-white/15">
      <div className="container">
        <div className="flex flex-col md:flex-row lg:flex-row items-center gap-8 justify-between">
          <div className="flex gap-2 items-center lg:flex-1">
            <Logo className="h-6 w-6" />
            <div className="font-medium">You are our first priority</div>
          </div>
          <nav className="flex flex-col lg:flex-row gap-5 lg:gap-7m lg:flex-1 md:flex-row">
            <a
              href="#"
              className="text-white/70 hover:text-white text-xs md:text-sm transition"
            >
              Features
            </a>
            <a
              href="#"
              className="text-white/70 hover:text-white text-xs md:text-sm transition"
            >
              Activation
            </a>
            <a
              href="#"
              className="text-white/70 hover:text-white text-xsmd:text-sm transition"
            >
              Status
            </a>
            <a
              href="#"
              className="text-white/70 hover:text-white text-xsmd:text-sm transition"
            >
              About
            </a>
          </nav>
          <div className="flex gap-5 lg:flex-1 lg:justify-end">
            <XSocial className="text-white/40 hover:text-white transition" />
            <InstaSocial className="text-white/40 hover:text-white transition" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
