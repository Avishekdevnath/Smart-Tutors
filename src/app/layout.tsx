import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactNode } from 'react';
import AuthProvider from '@/components/AuthProvider';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DashboardFooterWrapper from '@/components/DashboardFooterWrapper';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Tutors",
  description: "Tuition management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AdminAuthProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <DashboardFooterWrapper />
            </div>
          </AdminAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
