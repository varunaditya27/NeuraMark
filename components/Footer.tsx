"use client";

import React from "react";
import Link from "next/link";
import { Github, Twitter, FileText } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-slate-950/50 backdrop-blur-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent mb-4">
              NeuraMark
            </h3>
            <p className="text-gray-400 text-sm max-w-md">
              Secure, immutable proof-of-authorship verification for AI-generated content. 
              Powered by blockchain technology and IPFS storage.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="/docs"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <FileText className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/register" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">
                  Register Proof
                </Link>
              </li>
              <li>
                <Link href="/verify" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">
                  Verify Proof
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://sepolia.etherscan.io/address/0x6F20CFA1223818e4C00Fa1992557fe95757E3877" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-400 transition-colors text-sm"
                >
                  Smart Contract
                </a>
              </li>
              <li>
                <a href="/docs" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">
                  Documentation
                </a>
              </li>
              <li>
                <a href="https://sepolia-faucet.pk910.de/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">
                  Sepolia Faucet
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} NeuraMark. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a href="/privacy" className="text-gray-400 hover:text-indigo-400 transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-gray-400 hover:text-indigo-400 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
