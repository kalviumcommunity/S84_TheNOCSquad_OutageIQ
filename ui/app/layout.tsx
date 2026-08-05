import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "OutageIQ | Network Outage Impact Prioritization Engine",
  description: "Fusing outage alerts, customer complaint logs, and region usage metrics into a composite, explainable Impact Score (0-100) for telecom NOC ops & leadership.",
  keywords: ["OutageIQ", "NOC Triage", "Telecom Outage", "Impact Score", "SLA Prevention", "Network Operations", "The NOC Squad"],
  authors: [{ name: "The NOC Squad - Bhawana Kumari & Karan Devgan" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark scroll-smooth`}
    >
      <body className="min-h-screen flex flex-col bg-gray-950 text-gray-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
