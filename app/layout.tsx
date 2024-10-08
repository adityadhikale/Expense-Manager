import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'

import { Toaster } from "@/components/ui/sonner";
import { SheetProvider } from "@/provider/sheet-provider";
import { QueryProviders } from "@/provider/query-provider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Expenses Manager - Track your income, expenses, and manage your finances all in one place",
  description: "Track your income, expenses, and manage your finances all in one place",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <QueryProviders>
            <SheetProvider/>
            <Toaster/>
            {children}
          </QueryProviders>
        </body>
      </html>
    </ClerkProvider>
  );
};
