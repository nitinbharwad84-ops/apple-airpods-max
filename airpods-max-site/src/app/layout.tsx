import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Use Inter for standard Apple look
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AirPods Max - Apple",
  description: "Immersive. Precise. Personal. High-fidelity audio with Active Noise Cancellation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-black text-white selection:bg-apple-accent selection:text-white`}
      >
        <div className="fixed inset-0 z-[1] opacity-40 mix-blend-overlay pointer-events-none bg-noise" />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
