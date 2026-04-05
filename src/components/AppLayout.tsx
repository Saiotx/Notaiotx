"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { Menu } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoginPage) {
    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
        {children}
      </div>
    );
  }

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Overlay on mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 border-b border-gray-200 bg-white shadow-sm z-20">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-2 font-semibold text-gray-800">Notaiotx</span>
        </div>
        
        {children}
      </div>
    </>
  );
}
