import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "LLM Fine-Tuning Platform",
  description: "Synthetic data generation and LLM fine-tuning platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-black text-white font-sans">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
