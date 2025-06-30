"use client";

import { JSX, useState } from "react";
import { ArrowLeft, ArrowRight, LogOutIcon, X, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useUserStore from "@/app/stores/useUserStore";

interface SidebarLink {
  name: string;
  href: string;
  icon: JSX.Element;
  select: boolean;
  roles?: string[]; // Optional array of roles that can see this link
}

interface SidebarProps {
  links: SidebarLink[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSelectLink: (href: string) => void;
}

export default function Sidebar({ links, isOpen, setIsOpen, onSelectLink }: SidebarProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useUserStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Determinar el color del avatar basado en el rol del usuario
  const getRoleColor = () => {
    switch(user?.role) {
      case "ADMIN":
        return "bg-purple-600";
      case "EMPLOYEE":
      default:
        return "bg-green-600";
    }
  };

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    router.push('/auth/login');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div
      className={`
        bg-gray-900 text-white flex flex-col
        ${isOpen ? "w-64" : "w-20"}
        transition-all duration-300
        h-screen
        fixed top-0 left-0 bottom-0
        z-50
        shadow-lg
      `}
    >
      {/* Logo */}
      <div className="flex justify-center py-4 px-2 border-b border-gray-800">
        <div className={`relative ${isOpen ? 'w-32' : 'w-12'} h-12`}>
          <Image 
            src="/logo.png" 
            alt="Logo del sistema" 
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Toggle button */}
      <div className="flex justify-end p-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-white hover:bg-gray-700 rounded-full"
        >
          {isOpen ? <ArrowLeft /> : <ArrowRight />}
        </button>
      </div>

      {/* User profile section */}
      {isAuthenticated && (
        <div className="mb-6 mt-2">
          <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
            {/* Avatar */}
            <div className={`${getRoleColor()} rounded-full w-10 h-10 flex items-center justify-center text-white font-medium`}>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            
            {/* User info - sólo visible cuando está expandido */}
            <div className={`transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
              <div className="font-medium truncate">{user?.name || "Usuario"}</div>
              <div className="text-xs text-gray-400 truncate">{user?.email}</div>
              <div className="text-xs bg-gray-700 px-2 py-0.5 rounded mt-1 inline-block">
                {user?.role === "ADMIN" && "Profesor"}
                {user?.role === "" && "Estudiante"}
                {user?.role === "ADMIN" && "Administrador"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto px-3">
        <div className="space-y-2">
          {links
            // Filter links based on user role
            .filter(link => {
              // If no roles are specified, show to all
              if (!link.roles) return true;
              // If user is not authenticated, don't show role-restricted links
              if (!isAuthenticated) return false;
              // Check if user's role is in the allowed roles
              return link.roles.includes(user?.role || '');
            })
            .map((link, index) => (
            <button
              key={index}
              onClick={() => {
                onSelectLink(link.href);
                router.push(link.href);
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors duration-300 
                ${link.select ? "bg-blue-600 text-white font-semibold" : "hover:bg-gray-700 text-gray-300"}`}
            >
              {/* Icon */}
              <span className="text-xl">{link.icon}</span>

              {/* Text (hidden if collapsed) */}
              <span
                className={`whitespace-nowrap overflow-hidden transition-opacity duration-300 ${
                  isOpen ? "opacity-100" : "opacity-0 w-0"
                }`}
              >
                {link.name}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Logout button at bottom */}
      {isAuthenticated && (
        <div className="mt-auto px-3 pb-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-red-700/50 text-gray-300 hover:text-white"
          >
            <span className="text-xl"><LogOutIcon /></span>
            <span
              className={`whitespace-nowrap overflow-hidden transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0 w-0"
              }`}
            >
              Cerrar sesión
            </span>
          </button>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                Cerrar sesión
              </h3>
              <button 
                onClick={cancelLogout}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que deseas cerrar la sesión?
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}