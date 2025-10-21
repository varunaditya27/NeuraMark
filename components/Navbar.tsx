"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./AuthModal";
import UnifiedAccountBadge from "./UnifiedAccountBadge";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/explorer", label: "Explorer" },
    { href: "/register", label: "Register" },
    { href: "/verify", label: "Verify" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/10 shadow-xl"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-lg blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-r from-indigo-500 to-teal-500 p-2 rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
              NeuraMark
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-sm font-medium transition-colors hover:text-indigo-400",
                  pathname === link.href
                    ? "text-indigo-400"
                    : "text-gray-300"
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-teal-500"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Auth & Wallet Section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <UnifiedAccountBadge />
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 text-white font-semibold hover:opacity-90 transition-all"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-gradient-to-r from-indigo-500/20 to-teal-500/20 text-indigo-400 border border-indigo-500/20"
                      : "text-gray-300 hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <div className="pt-4 border-t border-white/10">
                  <UnifiedAccountBadge />
                </div>
              )}
              {!user && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowAuthModal(true);
                  }}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 text-white font-semibold hover:opacity-90 transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </motion.nav>
  );
}
