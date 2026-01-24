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

export const metadata = {
  title: "MRK Turf",
  description: "Premium cricket and football turf for sports enthusiasts — play, train, and compete on world-class facilities.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        <ToastContainer />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
