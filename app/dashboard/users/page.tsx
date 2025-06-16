'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Trash2, Search, ChevronLeft, ChevronRight, X, UserPlus } from 'lucide-react';
import { userService } from '@/app/service/user.service';
import type { CreateUserDto, UpdateUserDto, UserRole } from '@/app/types/user';
import type { IUser } from '@/app/types/auth';

// Validation schema with Zod
const userSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido' }),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  role: z.enum(['STUDENT', 'ADMIN', 'EMPLOYEE'] as const).default('STUDENT'),
  identification: z.string(),
});

type UserFormValues = z.infer<typeof userSchema>;

const UsersManagement: React.FC = () => {
  // States
  const [users, setUsers] = useState<IUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const limit = 10;

  // React Hook Form
  const { 
    control, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitting } 
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema) as any, // Type assertion needed for zodResolver
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'STUDENT' as const,
      identification: ""
    }
  });

  // Load users
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const offset = (currentPage - 1) * limit;
      const response = await userService.getAll();
      console.log(response.data)
      if (response.success && response.data) {
        const usersData = Array.isArray(response.data.arrayList) ? response.data.arrayList : [];
        
        // Filter by search term if exists
        const filteredUsers = searchTerm
          ? usersData.filter(user => 
              user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : usersData;
        
        // Client-side pagination
        const paginatedUsers = filteredUsers.slice(offset, offset + limit);
        
        setUsers(paginatedUsers);
        setTotalUsers(filteredUsers.length);
      } else {
        setError('Error al cargar los usuarios');
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Open modal for new user
  const openNewUserModal = () => {
    setIsModalOpen(true);
    setCurrentUserId(null);
    reset({
      name: '',
      email: '',
      password: '',
      role: 'STUDENT',
      identification: ""
    });
  };

  // Open modal to edit user
  const handleEditUser = (user: IUser) => {
    setCurrentUserId(user.id);
    reset({
      name: user.name,
      email: user.email,
      password: '', // Password is not sent back from the API
      role: user.role,
      identification: "",
    });
    setIsModalOpen(true);
  };

  // Handle form submission
  const onSubmit = async (data: UserFormValues) => {
    try {
      if (currentUserId) {
        // Update existing user
        const updateData: UpdateUserDto = { ...data };
        // Don't update password if it's empty
        if (!updateData.password) {
          delete updateData.password;
        }
        await userService.update(currentUserId, updateData);
      } else {
        // Create new user
        await userService.create(data as CreateUserDto);
      }
      await loadUsers();
      closeAllModals();
    } catch (error) {
      console.error('Error al guardar el usuario:', error);
      setError('Error al guardar el usuario');
    }
  };

  // Confirm delete
  const handleDeleteClick = (id: number) => {
    setCurrentUserId(id);
    setIsDeleteModalOpen(true);
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!currentUserId) return;
    
    try {
      await userService.delete(currentUserId);
      await loadUsers();
      setIsDeleteModalOpen(false);
      setCurrentUserId(null);
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      setError('Error al eliminar el usuario');
    }
  };

  // Close modal and reset
  const closeAllModals = useCallback(() => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentUserId(null);
    reset({
      name: '',
      email: '',
      password: '',
      role: 'STUDENT',
    });
  }, [reset]);

  // Calculate total pages
  const totalPages = Math.ceil(totalUsers / limit) || 1;

  // Role badge colors
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'EMPLOYEE':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header and new user button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <button
          onClick={openNewUserModal}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded flex items-center"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar usuarios..."
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

      {/* Error message */}
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

      {/* Users table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
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
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role === 'ADMIN' ? 'Administrador' : user.role === 'EMPLOYEE' ? 'Empleado' : 'Usuario'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Pencil className="h-4 w-4 inline mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(user.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={user.role === 'ADMIN'}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{(currentPage - 1) * limit + 1}</span> a{' '}
            <span className="font-medium">
              {Math.min(currentPage * limit, totalUsers)}
            </span>{' '}
            de <span className="font-medium">{totalUsers}</span> usuarios
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 border rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
              <ChevronLeft className="h-4 w-4 inline" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === pageNum
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 border rounded ${
                currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              <ChevronRight className="h-4 w-4 inline" />
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                {currentUserId ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button onClick={closeAllModals} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit(onSubmit)(e);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={`w-full text-gray-700 px-3 py-2 border rounded-md ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  )}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="email"
                      className={`w-full text-gray-700 px-3 py-2 border rounded-md ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      disabled={!!currentUserId}
                    />
                  )}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {currentUserId ? 'Nueva Contraseña' : 'Contraseña'} 
                  {!currentUserId && <span className="text-red-500">*</span>}
                </label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="password"
                      className={`w-full text-gray-700 px-3 py-2 border rounded-md ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder={currentUserId ? 'Dejar en blanco para no cambiar' : ''}
                    />
                  )}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USER">Usuario</option>
                      <option value="EMPLOYEE">Empleado</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
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
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    'Guardando...'
                  ) : currentUserId ? (
                    'Actualizar Usuario'
                  ) : (
                    'Crear Usuario'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Eliminar Usuario
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleDeleteUser}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Eliminar
              </button>
              <button
                type="button"
                onClick={closeAllModals}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;