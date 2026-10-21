import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Integration Up - HubSpot Date Formatter and URL Shortener Workflow Actions",
  description: "Integration Up adds two workflow actions to HubSpot. The Date Formatter converts dates to US, EU, ISO, Asian and custom formats. The URL Shortener turns long links into Bitly short links, with custom domain support.",
  keywords: "HubSpot, workflow actions, date formatting, URL shortener, Bitly, automation, CRM",
  openGraph: {
    title: "Integration Up - Date Formatter and URL Shortener for HubSpot",
    description: "Two HubSpot workflow actions: format dates the way your customers expect, and shorten links with Bitly.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Integration Up - Date Formatter and URL Shortener for HubSpot",
    description: "HubSpot workflow actions to format dates in US, EU, ISO and custom formats, and to shorten links with Bitly.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || "GTM-NTDS7LH4"} />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
