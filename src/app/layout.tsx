import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "HubSpot Date Formatter - Security-First Workflow Integration",
  description: "Professional date formatting for HubSpot workflows. Zero permissions required, open source, and your data stays totally safe. Convert dates to US, UK, ISO, and custom formats instantly.",
  keywords: "HubSpot, date formatting, workflow actions, security, open source, automation, CRM",
  openGraph: {
    title: "HubSpot Date Formatter - It Just Works",
    description: "Give your customers the right date format. Secure, simple, reliable date formatting for HubSpot workflows.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "HubSpot Date Formatter - Security-First",
    description: "Professional date formatting for HubSpot workflows. Zero permissions, open source, totally secure.",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
