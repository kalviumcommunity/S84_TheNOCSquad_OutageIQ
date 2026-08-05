"use client";

import React, { useState, useEffect } from "react";

interface NavbarProps {
  onOpenDemo?: () => void;
}

export default function Navbar({ onOpenDemo }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-950/85 backdrop-blur-md border-b border-gray-800/80 py-3 shadow-2xl shadow-black/50"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                  OutageIQ
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase tracking-widest">
                  v1.0 PRD
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium hidden sm:block">
                The NOC Squad • Telecom Impact Engine
              </p>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-900/60 p-1.5 rounded-full border border-gray-800/80 backdrop-blur-sm">
            <a
              href="#calculator"
              className="px-4 py-1.5 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
            >
              Scoring Simulator
            </a>
            <a
              href="#queue-preview"
              className="px-4 py-1.5 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
            >
              Live Queue Demo
            </a>
            <a
              href="#personas"
              className="px-4 py-1.5 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
            >
              Personas
            </a>
            <a
              href="#methodology"
              className="px-4 py-1.5 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
            >
              Methodology
            </a>
            <a
              href="#prd-spec"
              className="px-4 py-1.5 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-full transition-all"
            >
              PRD Spec
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="#prd-spec"
              className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View PRD
            </a>
            <a
              href="#queue-preview"
              onClick={onOpenDemo}
              className="relative group overflow-hidden rounded-lg p-px font-semibold text-xs text-white"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 group-hover:opacity-90 transition-opacity"></span>
              <span className="relative block px-4 py-2 bg-gray-950/20 rounded-[7px] transition-colors group-hover:bg-transparent flex items-center gap-2">
                <span>Launch Interactive Queue</span>
                <svg className="w-3.5 h-3.5 text-blue-300 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-950/95 border-b border-gray-800 px-4 pt-3 pb-6 mt-3 space-y-3 backdrop-blur-xl">
          <a
            href="#calculator"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-900 hover:text-white"
          >
            Scoring Simulator
          </a>
          <a
            href="#queue-preview"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-900 hover:text-white"
          >
            Live Queue Demo
          </a>
          <a
            href="#personas"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-900 hover:text-white"
          >
            Target Personas
          </a>
          <a
            href="#methodology"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-900 hover:text-white"
          >
            Impact Methodology
          </a>
          <a
            href="#prd-spec"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-900 hover:text-white"
          >
            PRD Specification
          </a>
          <div className="pt-2 flex flex-col gap-2">
            <a
              href="#queue-preview"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              Launch Interactive Queue
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
