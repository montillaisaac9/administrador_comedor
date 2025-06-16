'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { careerService } from '@/app/service/career.service';
import type { Career } from '@/app/types/career';

// Esquema de validación con Zod
const careerSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido' }),
  description: z.string().optional(),
  isActive: z.boolean().default(true)
});

type CareerFormValues = z.infer<typeof careerSchema>;

const CareerManagement: React.FC = () => {
  // Estados
  const [careers, setCareers] = useState<Career[]>([]);
  const [totalCareers, setTotalCareers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCareerId, setCurrentCareerId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const limit = 10;

  // React Hook Form
  const { 
    control, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitting } 
  } = useForm<CareerFormValues>({
    resolver: zodResolver(careerSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true
    }
  });

  // Cargar carreras
  const loadCareers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Iniciando carga de carreras...');
      const offset = (currentPage - 1) * limit;
      const response = await careerService.getAll({ offset, limit });
      console.log('Respuesta del servidor (raw):', response);
      
      if (response && typeof response === 'object' && 'success' in response) {
        if (response.success && response.data) {
          const { arrayList: careersData, total } = response.data;
          console.log('Datos de carreras procesados:', careersData);
          
          if (!careersData || careersData.length === 0) {
            console.log('No se encontraron carreras');
            setCareers([]);
            setTotalCareers(0);
            return;
          }
          
          console.log('Total de carreras:', total);
          setCareers(careersData);
          setTotalCareers(total);
        } else {
          console.error('El servidor reportó un error:', response);
          const errorMessage = response.error?.message || 'Error al cargar las carreras';
          setError(errorMessage);
        }
      } else {
        console.error('Formato de respuesta inesperado:', response);
        setError('Formato de respuesta inesperado del servidor');
      }
    } catch (error) {
      console.error('Error al cargar carreras:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    loadCareers();
  }, [loadCareers]);

  // Abrir modal para crear nueva carrera
  const openNewCareerModal = () => {
    setIsModalOpen(true);
    setCurrentCareerId(null);
    reset({
      name: '',
      description: '',
      isActive: true
    });
  };

  // Abrir modal para editar carrera
  const handleEditCareer = (career: Career) => {
    setCurrentCareerId(career.id);
    reset({
      name: career.name,
      description: career.description || '',
      isActive: career.isActive
    });
    setIsModalOpen(true);
  };

  // Manejar envío del formulario
  const onSubmit = async (data: CareerFormValues) => {
    try {
      if (currentCareerId) {
        // Actualizar carrera existente
        await careerService.update(currentCareerId, data);
      } else {
        // Crear nueva carrera
        await careerService.create(data);
      }
      await loadCareers();
      closeAllModals();
    } catch (error) {
      console.error('Error al guardar la carrera:', error);
      setError('Error al guardar la carrera');
    }
  };

  // Confirmar eliminación
  const handleDeleteClick = useCallback((id: number) => {
    setCurrentCareerId(id);
    setIsDeleteModalOpen(true);
  }, []);

  // Eliminar carrera
  const handleDeleteCareer = async () => {
    if (!currentCareerId) return;
    
    try {
      await careerService.delete(currentCareerId);
      await loadCareers();
      setIsDeleteModalOpen(false);
      setCurrentCareerId(null);
    } catch (error) {
      console.error('Error al eliminar la carrera:', error);
      setError('Error al eliminar la carrera');
    }
  };

  // Cerrar modal y resetear
  const closeAllModals = useCallback(() => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentCareerId(null);
    reset({
      name: '',
      description: '',
      isActive: true
    });
  }, [reset]);

  // Cambiar estado activo/inactivo
  const toggleActiveStatus = async (id: number, currentStatus: boolean) => {
    try {
      await careerService.setActive(id, !currentStatus);
      await loadCareers();
    } catch (error) {
      console.error('Error al cambiar el estado:', error);
      setError('Error al actualizar el estado');
    }
  };

  // Calcular total de páginas
  const totalPages = Math.ceil(totalCareers / limit) || 1;

  return (
    <div className="p-6">
      {/* Encabezado y botón de nueva carrera */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Carreras</h1>
        <button
          onClick={openNewCareerModal}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Carrera
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar carreras..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de carreras */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : careers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay carreras registradas
                </td>
              </tr>
            ) : (
              careers.map((career) => (
                <tr key={career.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {career.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {career.description || 'Sin descripción'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      onClick={() => toggleActiveStatus(career.id, career.isActive)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                        career.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {career.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditCareer(career)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Pencil className="h-4 w-4 inline mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(career.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4 inline mr-1" />
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{((currentPage - 1) * limit) + 1}</span> a{' '}
            <span className="font-medium">{Math.min(currentPage * limit, totalCareers)}</span> de{' '}
            <span className="font-medium">{totalCareers}</span> resultados
          </div>
          <div className="flex">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-l ${
                currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 ${
                  page === currentPage 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                } border-t border-b border-gray-200`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-r ${
                currentPage === totalPages 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal para crear/editar carrera */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {currentCareerId ? 'Editar Carrera' : 'Nueva Carrera'}
              </h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      {...field}
                      className={`w-full px-3 py-2 border text-gray-700 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  )}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={3}
                      className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                />
              </div>

              <div className="mb-6">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                        Activo
                      </label>
                    </div>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                    isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {currentCareerId ? 'Actualizando...' : 'Creando...'}
                    </span>
                  ) : currentCareerId ? (
                    'Actualizar Carrera'
                  ) : (
                    'Crear Carrera'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Confirmar eliminación</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                ¿Está seguro de que desea eliminar esta carrera? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteCareer}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                    isSubmitting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isSubmitting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerManagement;
