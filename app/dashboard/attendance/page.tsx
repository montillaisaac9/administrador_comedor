'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Calendar, Download, ChevronLeft, ChevronRight, ArrowLeft, UserPlus } from 'lucide-react';

import { getAttendancesByMenu } from '@/app/service/attendance.service';
import UserSelectorModal from './components/UserSelectorModal';
import type { IAttendance, IMenuItemAttendance } from '@/app/types/attendance';

export default function AttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get URL parameters
  const menuId = searchParams.get('menuId') ? Number(searchParams.get('menuId')) : null;
  const menuItemId = searchParams.get('menuItemId') ? Number(searchParams.get('menuItemId')) : null;

  // States
  const [attendances, setAttendances] = useState<IAttendance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const [currentMenuItem, setCurrentMenuItem] = useState<IMenuItemAttendance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const limit = 15;

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  // Get menu details by menuItemId
  const getMenuDetailsByMenuItemId = useCallback(async (menuItemId: number) => {
    try {
      // This is a placeholder implementation
      // Replace with actual API call if needed
      return { menuId: 0 };
    } catch (error) {
      console.error('Error getting menu details:', error);
      return null;
    }
  }, []);

  // Fetch attendances
  const fetchAttendances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // If we have menuItemId but no menuId, we need to get menu details first
      if (menuItemId && !menuId) {
        const menuDetails = await getMenuDetailsByMenuItemId(menuItemId);
        if (menuDetails) {
          router.push(`/dashboard/attendance?menuId=${menuDetails.menuId}&menuItemId=${menuItemId}`);
          return;
        } else {
          setError('No se pudo cargar la información del menú');
          return;
        }
      }

      if (!menuId) {
        setError('No se proporcionó un ID de menú');
        return;
      }


      if (!menuItemId) {
        setError('No se proporcionó un ID de menú');
        return;
      }

      // If we have both menuId and menuItemId, fetch attendances
      const response = await getAttendancesByMenu(menuItemId, { 
        offset, 
        limit,
        search: searchTerm || undefined,
        date: dateFilter ? format(dateFilter, 'yyyy-MM-dd') : undefined,
      });
      
      // Verify response and data exist
      if (!response || !response.data) {
        throw new Error('No se recibieron datos de la API');
      }

      // Update state with received data
      if (menuItemId && response.data.arrayList.length > 0) {
        setCurrentMenuItem(response.data.arrayList[0].menuItem);
      }
      
      setAttendances(response.data.arrayList || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      console.error('Error loading attendances:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las asistencias');
    } finally {
      setLoading(false);
    }
  }, [menuId, menuItemId, offset, searchTerm, dateFilter, router, getMenuDetailsByMenuItemId]);

  // Effect to load data
  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PPP', { locale: es });
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  // Handle page change
  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
  };

  // Handle export to PDF
  const handleExportPDF = () => {
    if (!attendances.length) {
      setError('No hay datos de asistencia para exportar');
      return;
    }
    
    // This would be implemented with your PDF generation logic
    console.log('Exporting to PDF...');
  };

  // Go back
  const handleGoBack = () => {
    router.back();
  };

  // Refresh attendance list
  const refreshAttendances = useCallback(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  if (!menuItemId) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              No se ha seleccionado un menú. Por favor, selecciona un menú para ver sus asistencias.
            </p>
            <button
              onClick={handleGoBack}
              className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver atrás
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Cargando asistencias...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={handleGoBack}
              className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver atrás
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <div className="flex items-center">
            <button
              onClick={handleGoBack}
              className="mr-2 text-gray-500 hover:text-gray-700"
              title="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentMenuItem 
                  ? `Asistencias - ${formatDate(currentMenuItem.date)}`
                  : 'Registro de Asistencias'}
              </h1>
              <p className="mt-1 text-sm text-gray-700">
                {currentMenuItem?.dish?.title || 'Visualiza y gestiona las asistencias registradas.'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Agregar Asistencia
            </button>
            <button
              type="button"
              onClick={handleExportPDF}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* User Selector Modal */}
      <UserSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menuItemId={menuItemId}
        onSuccess={refreshAttendances}
      />

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="relative rounded-md shadow-sm flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md h-10"
            placeholder="Buscar por nombre o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="date"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md h-10"
            value={dateFilter ? format(dateFilter, 'yyyy-MM-dd') : ''}
            onChange={(e) => setDateFilter(e.target.value ? new Date(e.target.value) : null)}
          />
        </div>
      </div>

      {/* Table */}
      {!loading && attendances.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-gray-500">No se encontraron asistencias</p>
          {(searchTerm || dateFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDateFilter(null);
              }}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Usuario
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Cédula
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Plato
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Fecha
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Hora
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {attendances.map((attendance) => (
                      <tr key={attendance.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {attendance.user.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {attendance.user.identification}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {attendance.menuItem.dish.title}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatDate(attendance.menuItem.date)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {format(new Date(attendance.createdAt), 'HH:mm')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            onClick={() => handlePageChange(offset + limit)}
            disabled={offset + limit >= total}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{offset + 1}</span> a{' '}
              <span className="font-medium">{Math.min(offset + limit, total)}</span> de{' '}
              <span className="font-medium">{total}</span> resultados
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Anterior</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                onClick={() => handlePageChange(offset + limit)}
                disabled={offset + limit >= total}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Siguiente</span>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
