"use client";

import { useState } from "react";
import {
    BarChart4,
    Utensils,
    Pizza,
    GraduationCap,
    User
  } from "lucide-react";
  
  
import Sidebar from "@/app/components/sidebar";

const initialLinks = [
    { name: "Estadísticas", href: "/dashboard/statistics", icon: <BarChart4 />, select: true },
    { name: "Menús", href: "/dashboard/menus", icon: <Utensils />, select: false },
    { name: "Platos", href: "/dashboard/dishes", icon: <Pizza />, select: false },
    { name: "Carreras Universitarias", href: "/dashboard/carriers", icon: <GraduationCap />, select: false },
    { name: "Usuarios", href: "/dashboard/users", icon: <User />, select: false },
  ];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [links, setLinks] = useState(initialLinks);

  // Función para actualizar la selección de links
  const handleSelectLink = (selectedHref: string) => {
    setLinks(prevLinks =>
      prevLinks.map(link => ({
        ...link,
        select: link.href === selectedHref
      }))
    );
  };
 
  return (
    <div className="flex min-h-screen">
      {/* Sidebar colapsable */}
      <Sidebar
        links={links}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onSelectLink={handleSelectLink} // Pasamos la función
      />

      {/* Contenido principal */}
      <main
        className={`
          flex-1 overflow-auto bg-gray-100 p-6
          transition-all duration-300
          ${isSidebarOpen ? "ml-64" : "ml-16"}
        `}
      >
        {children}
      </main>
    </div>
  );
}
