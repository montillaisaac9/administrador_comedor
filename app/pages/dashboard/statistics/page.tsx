// app/pages/dashboard/statistics/stats-client.tsx
'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardData {
  visits: number;
  consultations: number;
  satisfaction: number;
  budget: number;
  weeklyAssistance: {
    day: string;
    visits: number;
  }[];
}

const StatsClientComponent: React.FC = () => {
  // Datos de ejemplo que coinciden con la imagen
  const dashboardData: DashboardData = {
    visits:  1.234,
    consultations: 23543,
    satisfaction: 4.2,
    budget: 45231.89,
    weeklyAssistance: [
      { day: 'Lun', visits: 220 },
      { day: 'Mar', visits: 180 },
      { day: 'Mié', visits: 240 },
      { day: 'Jue', visits: 260 },
      { day: 'Vie', visits: 230 },
    ]
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        {/* Cards de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Card 1: Total Visitas */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Total Visitas</h2>
            <p className="text-3xl font-bold text-gray-800">{dashboardData.visits.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">+3.4% desde el mes pasado</p>
          </div>
          
          {/* Card 2: Consultas Resueltas */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Consultas Resueltas</h2>
            <p className="text-3xl font-bold text-gray-800">{dashboardData.consultations.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">+2.7% desde el mes pasado</p>
          </div>
          
          {/* Card 3: Valoración Promedio */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Valoración Promedio</h2>
            <p className="text-3xl font-bold text-gray-800">{dashboardData.satisfaction}</p>
            <p className="text-xs text-gray-500 mt-1">+0.1 puntos en este período</p>
          </div>
          
          {/* Card 4: Presupuesto Mensual */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Presupuesto Mensual</h2>
            <p className="text-3xl font-bold text-gray-800">${dashboardData.budget.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-gray-500 mt-1">+5.3% respecto al objetivo</p>
          </div>
        </div>
        
        {/* Gráfico de Asistencia Semanal */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Asistencia Semanal</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.weeklyAssistance}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="visits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsClientComponent;