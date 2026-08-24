"use client";

import React, { useState } from "react";
import Link from "next/link";

interface NavbarProps {
  onOpenDemo?: () => void;
}

export default function Navbar({ onOpenDemo }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gray-950/90 border-b border-gray-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Tag */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <span className="text-xl font-black text-white">⚡</span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-gray-950"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                  OutageIQ
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium hidden sm:block">
                The NOC Squad • Telecom Operations Platform
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-900/60 p-1.5 rounded-full border border-gray-800/80 backdrop-blur-sm">
            <Link
              href="/overview"
              className="px-4 py-1.5 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
            >
              Overview
            </Link>
            <Link
              href="/queue"
              className="px-4 py-1.5 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
            >
              Outage Queue
            </Link>
            <Link
              href="/regions"
              className="px-4 py-1.5 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
            >
              Region View
            </Link>
            <Link
              href="/analytics"
              className="px-4 py-1.5 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
            >
              Analytics
            </Link>
            <Link
              href="/export"
              className="px-4 py-1.5 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
            >
              Exportable Data
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/queue"
              className="relative group overflow-hidden rounded-lg p-px font-semibold text-xs text-white"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 group-hover:opacity-90 transition-opacity"></span>
              <span className="relative block px-4 py-2 bg-gray-950/20 rounded-[7px] transition-colors group-hover:bg-transparent flex items-center gap-2">
                <span>Launch Interactive Queue</span>
                <svg className="w-3.5 h-3.5 text-blue-300 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-950 border-b border-gray-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/overview"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-900"
          >
            Overview
          </Link>
          <Link
            href="/queue"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-900"
          >
            Outage Queue
          </Link>
          <Link
            href="/regions"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-900"
          >
            Region View
          </Link>
          <Link
            href="/analytics"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-900"
          >
            Analytics
          </Link>
          <Link
            href="/export"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-900"
          >
            Exportable Data
          </Link>
        </div>
      )}
    </header>
  );
}
