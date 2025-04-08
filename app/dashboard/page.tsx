'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/context/AuthContext';
import { apiGet } from '@/lib/api';

interface DashboardStats {
  totalUsers: number;
  totalCarriers: number;
  totalDishes: number;
  totalMenus: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCarriers: 0,
    totalDishes: 0,
    totalMenus: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real implementation, you'd fetch this data from the API
        // For now, we'll just simulate some data
        
        // Example API calls (commented out for now)
        // const carriersResponse = await apiGet('/carriers');
        // const dishesResponse = await apiPost('/dish/all', { offset: 0, limit: 1 });
        
        // Simulated response
        const mockStats: DashboardStats = {
          totalUsers: 15,
          totalCarriers: 8,
          totalDishes: 25,
          totalMenus: 5,
        };
        
        setStats(mockStats);
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="page-container">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Bienvenido, {user?.name || 'Administrador'}
          </h1>
          <p className="text-gray-600">
            Panel de administración del comedor
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2C78DA]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="stat-card">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Usuarios</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-[#2C78DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Carreras</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalCarriers}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-[#2C78DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Platos</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalDishes}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-[#2C78DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Menús</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalMenus}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-[#2C78DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Actividad reciente</h2>
            <p className="text-gray-600">
              No hay actividad reciente para mostrar.
            </p>
          </div>
          
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Acciones rápidas</h2>
            <div className="space-y-2">
              <button className="w-full bg-[#2C78DA] hover:bg-[#2368c0] text-white font-medium py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C78DA] transition-colors">
                Crear nuevo usuario
              </button>
              <button className="w-full bg-[#FFDEAB] text-gray-800 hover:bg-[#ffead0] focus:ring-2 focus:ring-[#FFDEAB] focus:ring-offset-2 font-medium py-2 px-4 rounded-md shadow-sm focus:outline-none transition-colors">
                Crear nuevo plato
              </button>
              <button className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C78DA] transition-colors">
                Gestionar menús
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 