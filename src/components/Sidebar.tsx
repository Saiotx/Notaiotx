'use client';

import {
  Home,
  Star,
  FileText,
  CheckCircle2,
  Folder,
  Calendar,
  LayoutTemplate,
  Book,
  Tag,
  Users,
  LayoutGrid,
  Plus,
  Search,
  MoreHorizontal,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Inicio', icon: Home, href: '/' },
    { name: 'Favoritos', icon: Star, href: '/accesos-directos' },
    { name: 'Notas', icon: FileText, href: '/notas' },
    { name: 'Cuadernos', icon: Book, href: '/cuadernos' },
    { name: 'Tareas', icon: CheckCircle2, href: '/tareas' },
    { name: 'Archivos', icon: Folder, href: '/archivos' },
    { name: 'Calendario', icon: Calendar, href: '/calendario' },
    { name: 'Plantillas', icon: LayoutTemplate, href: '/plantillas' },
    { name: 'Etiquetas', icon: Tag, href: '/etiquetas' },
    { name: 'Compartido conmigo', icon: Users, href: '/compartido' },
    { name: 'Espacios', icon: LayoutGrid, href: '/espacios' },
  ];

  return (
    <div className="w-64 h-screen bg-[#F8F9FA] flex flex-col border-r border-gray-200 shrink-0">
      {/* Search Header */}
      <div className="p-4 flex flex-col gap-4">
        <div className="relative relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar"
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 hover:bg-gray-200 transition-colors"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button className="flex-1 bg-[#00a82d] text-white font-medium py-2 px-3 rounded-full flex items-center justify-center gap-2 hover:bg-[#008f26] shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M9 15h6" /><path d="M12 18v-6" /></svg>
            <span>Nota</span>
          </button>

          <button className="w-8 h-8 rounded-full border border-gray-200 text-purple-500 hover:bg-gray-100 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
          </button>
          <button className="w-8 h-8 rounded-full border border-gray-200 text-orange-500 hover:bg-gray-100 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="M10 16h4" /><path d="M12 14v4" /></svg>
          </button>
          <button className="w-8 h-8 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 flex items-center justify-center shrink-0">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5 mt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                ? 'bg-gray-200 font-medium text-black'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <item.icon className="w-4 h-4 shrink-0 text-gray-600" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer User Area */}
      <div className="p-4 border-t border-gray-200 flex flex-col gap-4">
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 -mx-2 rounded-lg">
          <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-semibold">
            S
          </div>
          <span className="text-xs text-gray-700 truncate font-medium">saioagartzia@gmail.com</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-mono">v11</span>
            <Bell className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
