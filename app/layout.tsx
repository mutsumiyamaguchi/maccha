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
  title: 'レシピ提案アプリ',
  description: '条件に合ったレシピをAIが提案してくれるWebアプリ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-100 text-gray-900 font-sans antialiased">
        <div className="container mx-auto max-w-2xl p-4">
          {children}
        </div>
      </body>
    </html>
  );
}
