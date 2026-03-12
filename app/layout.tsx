import "./globals.css";

import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { EventEmitter } from "events";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
// import { ContentHeader } from "@/components/ContentHeader";

// Increase EventEmitter listener limit to prevent memory leak warnings
EventEmitter.defaultMaxListeners = 20;

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "School App",
  description: "School login & dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} custom-scrollbar ${nunito.className} antialiased`}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
            <main className="flex-1 relative overflow-y-auto">{children}</main>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
