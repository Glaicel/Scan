import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { useRouter } from 'next/router'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Scan",
  description: "Scan withou hassle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
