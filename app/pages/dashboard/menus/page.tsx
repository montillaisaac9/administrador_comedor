'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from './components/modal';
import { format, addDays, startOfWeek, endOfWeek, isMonday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { getDish, createMenu, getAllMenus, updateMenu, DeleteMenu } from '@/app/service/menu.service';
import { DishSelect, IMenuDetails, IMenuItemDetail, WeekDay, IUpdateMenu } from '@/app/types/menu';

// Esquema de validación con Zod actualizado para usar menuItems
const menuSchema = z.object({
  weekStart: z.date().refine((date) => isMonday(date), {
    message: "La fecha de inicio debe ser un lunes"
  }),
  weekEnd: z.date(),
  isActive: z.boolean(),
  menuItems: z.array(
    z.object({
      weekDay: z.nativeEnum(WeekDay),
      dishId: z.coerce.number().int().positive(),
      date: z.string()
    })
  ).length(5, { message: "Debe asignar platos para todos los días de la semana" })
});

type MenuFormValues = z.infer<typeof menuSchema>;

const MenuManagement: React.FC = () => {
  // Estados
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [dishes, setDishes] = useState<DishSelect[]>([]);
  const [menus, setMenus] = useState<IMenuDetails[]>([]);
  const [totalMenus, setTotalMenus] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingDishes, setLoadingDishes] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMenuId, setCurrentMenuId] = useState<number | null>(null);
  const [menuToDelete, setMenuToDelete] = useState<number | null>(null);
  const limit = 5;

  // React Hook Form
  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      weekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
      weekEnd: endOfWeek(new Date(), { weekStartsOn: 1 }),
      isActive: true,
      menuItems: []
    }
  });

  // Observador para la fecha de inicio
  const watchWeekStart = watch('weekStart');
  
  // Efecto para actualizar la fecha de fin y los menuItems cuando cambia la fecha de inicio
  useEffect(() => {
    if (watchWeekStart) {
      // Actualizar la fecha de fin (viernes)
      setValue('weekEnd', addDays(watchWeekStart, 4)); // Lunes a viernes (5 días)
      
      // Generar los menuItems con fechas actualizadas
      const menuItems = [
        { weekDay: WeekDay.MONDAY, dishId: 0, date: format(watchWeekStart, 'yyyy-MM-dd') },
        { weekDay: WeekDay.TUESDAY, dishId: 0, date: format(addDays(watchWeekStart, 1), 'yyyy-MM-dd') },
        { weekDay: WeekDay.WEDNESDAY, dishId: 0, date: format(addDays(watchWeekStart, 2), 'yyyy-MM-dd') },
        { weekDay: WeekDay.THURSDAY, dishId: 0, date: format(addDays(watchWeekStart, 3), 'yyyy-MM-dd') },
        { weekDay: WeekDay.FRIDAY, dishId: 0, date: format(addDays(watchWeekStart, 4), 'yyyy-MM-dd') }
      ];
      
      setValue('menuItems', menuItems);
    }
  }, [watchWeekStart, setValue]);

  // Cargar los platos disponibles
  useEffect(() => {
    const loadDishes = async () => {
      setLoadingDishes(true);
      try {
        const dishesData = await getDish();
        setDishes(dishesData);
      } catch (error) {
        console.error('Error al cargar los platos:', error);
      } finally {
        setLoadingDishes(false);
      }
    };
    
    loadDishes();
  }, []);

  // Cargar la lista de menús con paginación
  const loadMenus = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * limit;
      const response = await getAllMenus({ offset, limit });
      
      if (response.success && response.data != null) {
        setMenus(response.data.arrayList);
        setTotalMenus(response.data.total);
      }
    } catch (error) {
      console.error('Error al cargar los menús:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, [currentPage]);

  // Abrir el modal de edición con los datos del menú seleccionado
  const handleEditMenu = (menu: IMenuDetails) => {
    setIsEditing(true);
    setCurrentMenuId(menu.id);
    
    // Parsear fechas
    const weekStartDate = parseISO(menu.weekStart);
    const weekEndDate = parseISO(menu.weekEnd);
    
    // Establecer valores del formulario
    reset({
      weekStart: weekStartDate,
      weekEnd: weekEndDate,
      isActive: menu.isActive,
      menuItems: menu.menuItems.map(item => ({
        weekDay: item.weekDay,
        dishId: item.dishId,
        date: item.date
      }))
    });
    
    setIsModalOpen(true);
  };

  // Manejador para crear o actualizar un menú
  const onSubmit = async (data: MenuFormValues) => {
    setLoading(true);
    try {
      // Convertir las fechas a formato string para la API
      const formattedData = {
        weekStart: format(data.weekStart, 'yyyy-MM-dd'),
        weekEnd: format(data.weekEnd, 'yyyy-MM-dd'),
        isActive: data.isActive,
        menuItems: data.menuItems.map(item => ({
          weekDay: item.weekDay,
          dishId: item.dishId,
          date: item.date
        }))
      };
      
      let response;
      
      if (isEditing && currentMenuId) {
        // Actualizar menú existente
        response = await updateMenu(currentMenuId, formattedData);
      } else {
        // Crear nuevo menú
        response = await createMenu(formattedData);
      }
      
      if (response.success) {
        // Recargar la lista de menús
        await loadMenus();
        closeModal();
      }
    } catch (error) {
      console.error(`Error al ${isEditing ? 'actualizar' : 'crear'} menú:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Manejador para eliminar un menú
  const handleDeleteMenu = async () => {
    if (menuToDelete) {
      setLoading(true);
      try {
        const response = await DeleteMenu(menuToDelete);
        if (response.success) {
          // Recargar la lista de menús
          await loadMenus();
        }
      } catch (error) {
        console.error('Error al eliminar menú:', error);
      } finally {
        setLoading(false);
        setIsDeleteModalOpen(false);
        setMenuToDelete(null);
      }
    }
  };

  // Cerrar modal y resetear estados
  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentMenuId(null);
    reset({
      weekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
      weekEnd: endOfWeek(new Date(), { weekStartsOn: 1 }),
      isActive: true,
      menuItems: []
    });
  };

  // Función para abrir modal de nuevo menú
  const openNewMenuModal = () => {
    setIsEditing(false);
    setCurrentMenuId(null);
    reset({
      weekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
      weekEnd: endOfWeek(new Date(), { weekStartsOn: 1 }),
      isActive: true,
      menuItems: []
    });
    setIsModalOpen(true);
  };

  // Función para confirmar eliminación
  const confirmDelete = (menuId: number) => {
    setMenuToDelete(menuId);
    setIsDeleteModalOpen(true);
  };

  // Función para formatear fechas de manera segura
  const formatDate = (date: Date | string) => {
    try {
      // Si es un string, intentamos parsearlo a Date
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      
      // Verificamos si es una fecha válida
      if (isNaN(dateObj.getTime())) {
        return 'Fecha inválida';
      }
      
      return format(dateObj, 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };

  // Función para manejar la paginación
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calcular total de páginas
  const totalPages = Math.ceil(totalMenus / limit);

  // Función para obtener el plato por día de la semana
  const getDishByWeekDay = (menu: IMenuDetails, weekDay: WeekDay): IMenuItemDetail | undefined => {
    return menu.menuItems.find(item => item.weekDay === weekDay);
  };

  // Función para obtener el nombre del plato
  const getDishName = (dishId: number): string => {
    const dish = dishes.find(d => d.id === dishId);
    return dish ? dish.title : `Plato #${dishId}`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Menús Semanales</h1>
        <button
          onClick={openNewMenuModal}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
        >
          Nuevo Menú
        </button>
      </div>

      {/* Tabla de menús */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semana</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lunes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Martes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miércoles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jueves</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Viernes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <Spinner />
                  </div>
                </td>
              </tr>
            ) : menus.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay menús disponibles
                </td>
              </tr>
            ) : (
              menus.map((menu) => {
                const mondayDish = getDishByWeekDay(menu, WeekDay.MONDAY);
                const tuesdayDish = getDishByWeekDay(menu, WeekDay.TUESDAY);
                const wednesdayDish = getDishByWeekDay(menu, WeekDay.WEDNESDAY);
                const thursdayDish = getDishByWeekDay(menu, WeekDay.THURSDAY);
                const fridayDish = getDishByWeekDay(menu, WeekDay.FRIDAY);
                
                return (
                  <tr key={menu.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {menu.weekStart && menu.weekEnd ? 
                        `${formatDate(menu.weekStart)} - ${formatDate(menu.weekEnd)}` : 
                        'Fechas no disponibles'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${menu.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {menu.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mondayDish && mondayDish.dish ? mondayDish.dish.title : mondayDish ? `Plato #${mondayDish.dishId}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tuesdayDish && tuesdayDish.dish ? tuesdayDish.dish.title : tuesdayDish ? `Plato #${tuesdayDish.dishId}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {wednesdayDish && wednesdayDish.dish ? wednesdayDish.dish.title : wednesdayDish ? `Plato #${wednesdayDish.dishId}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {thursdayDish && thursdayDish.dish ? thursdayDish.dish.title : thursdayDish ? `Plato #${thursdayDish.dishId}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fridayDish && fridayDish.dish ? fridayDish.dish.title : fridayDish ? `Plato #${fridayDish.dishId}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => handleEditMenu(menu)} 
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => confirmDelete(menu.id)} 
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-700">
          Mostrando <span className="font-medium">{((currentPage - 1) * limit) + 1}</span> a <span className="font-medium">{Math.min(currentPage * limit, totalMenus)}</span> de <span className="font-medium">{totalMenus}</span> resultados
        </div>
        <div className="flex">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-l ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          >
            &larr;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 ${page === currentPage ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-r ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          >
            &rarr;
          </button>
        </div>
      </div>

      {/* Modal para crear o editar menú */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={isEditing ? "Editar Menú" : "Nuevo Menú"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio (Lunes)</label>
              <Controller
                control={control}
                name="weekStart"
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={(date: Date) => field.onChange(date)}
                    filterDate={isMonday}
                    dateFormat="dd/MM/yyyy"
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
              {errors.weekStart && <p className="mt-1 text-sm text-red-600">{errors.weekStart.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de fin (Viernes)</label>
              <Controller
                control={control}
                name="weekEnd"
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={(date: Date) => field.onChange(date)}
                    dateFormat="dd/MM/yyyy"
                    className="w-full px-3 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                )}
              />
            </div>
          </div>

          <div>
            <Controller
              control={control}
              name="isActive"
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
                    Menú activo (disponible para los comensales)
                  </label>
                </div>
              )}
            />
          </div>

          {/* Selectores de platos para cada día */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Asignar platos a los días</h3>
            
            {loadingDishes ? (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            ) : (
              <>
                {/* Lunes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lunes</label>
                  <Controller
                    control={control}
                    name="menuItems.0.dishId"
                    render={({ field }) => (
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>Seleccione un plato</option>
                        {dishes.map((dish) => (
                          <option key={`monday-${dish.id}`} value={dish.id}>{dish.title}</option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.menuItems?.[0]?.dishId && (
                    <p className="mt-1 text-sm text-red-600">{errors.menuItems?.[0]?.dishId.message}</p>
                  )}
                </div>

                {/* Martes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Martes</label>
                  <Controller
                    control={control}
                    name="menuItems.1.dishId"
                    render={({ field }) => (
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>Seleccione un plato</option>
                        {dishes.map((dish) => (
                          <option key={`tuesday-${dish.id}`} value={dish.id}>{dish.title}</option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.menuItems?.[1]?.dishId && (
                    <p className="mt-1 text-sm text-red-600">{errors.menuItems?.[1]?.dishId.message}</p>
                  )}
                </div>

                {/* Miércoles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Miércoles</label>
                  <Controller
                    control={control}
                    name="menuItems.2.dishId"
                    render={({ field }) => (
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>Seleccione un plato</option>
                        {dishes.map((dish) => (
                          <option key={`wednesday-${dish.id}`} value={dish.id}>{dish.title}</option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.menuItems?.[2]?.dishId && (
                    <p className="mt-1 text-sm text-red-600">{errors.menuItems?.[2]?.dishId.message}</p>
                  )}
                </div>

                {/* Jueves */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jueves</label>
                  <Controller
                    control={control}
                    name="menuItems.3.dishId"
                    render={({ field }) => (
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>Seleccione un plato</option>
                        {dishes.map((dish) => (
                          <option key={`thursday-${dish.id}`} value={dish.id}>{dish.title}</option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.menuItems?.[3]?.dishId && (
                    <p className="mt-1 text-sm text-red-600">{errors.menuItems?.[3]?.dishId.message}</p>
                  )}
                </div>

                {/* Viernes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Viernes</label>
                  <Controller
                    control={control}
                    name="menuItems.4.dishId"
                    render={({ field }) => (
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>Seleccione un plato</option>
                        {dishes.map((dish) => (
                          <option key={`friday-${dish.id}`} value={dish.id}>{dish.title}</option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.menuItems?.[4]?.dishId && (
                    <p className="mt-1 text-sm text-red-600">{errors.menuItems?.[4]?.dishId.message}</p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || loadingDishes}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${loading || loadingDishes ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? (
                <div className="flex items-center">
                  <Spinner size="sm" className="mr-2" /> {isEditing ? 'Actualizando...' : 'Creando...'}
                </div>
              ) : (
                isEditing ? 'Actualizar Menú' : 'Crear Menú'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar eliminación"
      >
        <div className="py-4">
          <p className="text-gray-700">¿Está seguro de que desea eliminar este menú? Esta acción no se puede deshacer.</p>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteMenu}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {loading ? (
                <div className="flex items-center">
                  <Spinner size="sm" className="mr-2" /> Eliminando...
                </div>
              ) : (
                'Eliminar'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Componente Spinner simple
const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg', className?: string }> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
  );
};

export default MenuManagement;