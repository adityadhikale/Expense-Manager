"use client";

import Link from "next/link";
import { Github, Mail, Heart, Home, Wallet, CreditCard, Tags } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function Footer() {
  const [currentYear, setCurrentYear] = useState(2025);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    setMounted(true);
  }, []);
  
  // Don't render anything on the server, or before client hydration is complete
  if (!mounted) {
    return null;
  }
  
  // Don't show footer on auth pages
  if (pathname === "/sign-in" || pathname === "/sign-up") {
    return null;
  }
  
  return (
    <footer className="w-full bg-[#333333] text-white mt-auto">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-[#6cc1ab] rounded-lg p-2">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Expense Manager</h2>
            </div>
            <p className="text-gray-300 text-sm">
              Track and manage your expenses easily with our intuitive financial management platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/" 
                  className="text-gray-300 hover:text-[#6cc1ab] transition-all duration-200 flex items-center group"
                >
                  <span className="bg-transparent group-hover:bg-[#6cc1ab]/10 rounded p-1.5 mr-2 transition-all duration-200">
                    <Home className="h-4 w-4" />
                  </span>
                  Overview
                </Link>
              </li>
              <li>
                <Link 
                  href="/accounts" 
                  className="text-gray-300 hover:text-[#6cc1ab] transition-all duration-200 flex items-center group"
                >
                  <span className="bg-transparent group-hover:bg-[#6cc1ab]/10 rounded p-1.5 mr-2 transition-all duration-200">
                    <CreditCard className="h-4 w-4" />
                  </span>
                  Accounts
                </Link>
              </li>
              <li>
                <Link 
                  href="/transactions" 
                  className="text-gray-300 hover:text-[#6cc1ab] transition-all duration-200 flex items-center group"
                >
                  <span className="bg-transparent group-hover:bg-[#6cc1ab]/10 rounded p-1.5 mr-2 transition-all duration-200">
                    <Wallet className="h-4 w-4" />
                  </span>
                  Transactions
                </Link>
              </li>
              <li>
                <Link 
                  href="/categories" 
                  className="text-gray-300 hover:text-[#6cc1ab] transition-all duration-200 flex items-center group"
                >
                  <span className="bg-transparent group-hover:bg-[#6cc1ab]/10 rounded p-1.5 mr-2 transition-all duration-200">
                    <Tags className="h-4 w-4" />
                  </span>
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <Link
                href="https://github.com/adityadhikale/Expense-Manager"
                target="_blank"
                rel="noreferrer"
                className="text-gray-300 hover:text-[#6cc1ab] transition-colors"
              >
                <Github className="h-6 w-6" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="mailto:adityadhikale2003@gmail.com"
                className="text-gray-300 hover:text-[#6cc1ab] transition-colors"
              >
                <Mail className="h-6 w-6" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-300">
              © {currentYear} Expense Manager. All rights reserved.
            </p>
            <p className="text-sm text-gray-300 flex items-center gap-1">
              Built with <Heart className="h-4 w-4 text-[#6cc1ab]" /> by{" "}
              <Link
                href="https://github.com/adityadhikale"
                target="_blank"
                rel="noreferrer"
                className="text-[#6cc1ab] hover:text-[#7dd1bb] transition-colors"
              >
                Aditya
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
