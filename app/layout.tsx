import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'

import { Toaster } from "@/components/ui/sonner";
import { SheetProvider } from "@/provider/sheet-provider";
import { QueryProviders } from "@/provider/query-provider";
import { AuthLoading } from "@/components/auth-loading";

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
    <ClerkProvider 
      appearance={{
        layout: {
          socialButtonsVariant: "iconButton",
          socialButtonsPlacement: "bottom",
        },
        variables: {
          colorPrimary: '#45ad93',
        },
      }}
    >
      <html lang="en">
        <body className={inter.className}>
          <QueryProviders>
            <AuthLoading>
              <SheetProvider/>
              <Toaster/>
              {children}
            </AuthLoading>
          </QueryProviders>
        </body>
      </html>
    </ClerkProvider>
  );
};
