import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VTuber Profile Builder",
  description: "Modern, Glassmorphism Profile Builder for VTubers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark scroll-smooth">
      <body className={`${inter.className} antialiased text-white`}>
        {children}
      </body>
    </html>
  );
}
