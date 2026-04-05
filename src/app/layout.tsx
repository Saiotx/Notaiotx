import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Notaiotx",
  description: "A pixel-perfect Evernote clone built with Next.js and Tailwind CSS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased bg-white text-gray-900 h-screen overflow-hidden flex`}>
        {/* Global Sidebar layout */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {children}

        </div>
      </body>
    </html>
  );
}
