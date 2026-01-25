import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Layout/Header";
import ClientLayout from "./components/Layout/ClientLayout";
import { ToastContainer } from 'react-toastify';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { getTenant } from "../lib/tenant";

export async function generateMetadata() {
  const tenant = await getTenant();
  return {
    title: tenant ? tenant.name : "Booking Platform",
    description: tenant ? `Book spaces with ${tenant.name}` : "Premium booking platform.",
  };
}

export default async function RootLayout({ children }) {
  const tenant = await getTenant();
  const theme = tenant?.settings?.theme || { primaryColor: "#10b981" };

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} style={{ '--primary-color': theme.primaryColor }}>
        <Header />
        <ToastContainer />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
