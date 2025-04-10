// app/pages/dashboard/dishes/dish-client.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getAllDishes, getDishById, createDish, updateDish, DishDto, UpdateDishDto } from '@/app/service/dish.service';

const DishClient: React.FC = () => {
  // Estados para gestionar los platos
  const [dishes, setDishes] = useState<DishDto[]>([]);
  const [totalDishes, setTotalDishes] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para el formulario de plato
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentDish, setCurrentDish] = useState<Partial<DishDto> | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Referencia al input de archivos
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para la imagen
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  // Cargar platos al inicio
  useEffect(() => {
    fetchDishes();
  }, [offset, limit]);

  // Función para obtener todos los platos
  const fetchDishes = async () => {
    try {
      setLoading(true);
      const response = await getAllDishes({ offset, limit });
      if (response.success) {
        setDishes(response.data.arrayList);
        setTotalDishes(response.data.total);
      } else {
        setError(response.message || 'Error al cargar los platos');
      }
    } catch (error) {
      setError('Error al conectar con el servidor');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener un plato específico
  const fetchDish = async (id: number) => {
    try {
      setLoading(true);
      const response = await getDishById(id);
      if (response.success) {
        setCurrentDish(response.data);
        setIsEditing(true);
        setShowModal(true);
        // Si el plato tiene una foto, establecer la vista previa
        if (response.data.photo) {
          setImagePreview(response.data.photo);
        } else {
          setImagePreview(null);
        }
      } else {
        setError(response.message || 'Error al cargar el plato');
      }
    } catch (error) {
      setError('Error al conectar con el servidor');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la selección de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // Crear URL de vista previa
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Función para abrir el selector de archivos
  const handleSelectImage = () => {
    fileInputRef.current?.click();
  };

  // Función para subir la imagen (simulada)
  const uploadImage = async (file: File): Promise<string> => {
    // Aquí deberías implementar la lógica real de subida de imágenes a tu servidor
    // Esta es una simulación que devuelve una URL temporal
    setUploadingImage(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setUploadingImage(false);
        // En una implementación real, esta URL vendría del servidor después de subir la imagen
        resolve(URL.createObjectURL(file));
      }, 1500);
    });
  };

  // Función para crear un nuevo plato
  const handleCreateDish = async (dish: Omit<DishDto, 'id'>) => {
    try {
      setLoading(true);
      
      // Si hay una imagen seleccionada, subirla primero
      let photoUrl = dish.photo;
      if (selectedImage) {
        photoUrl = await uploadImage(selectedImage);
      }
      
      const dishWithPhoto = { ...dish, photo: photoUrl };
      const response = await createDish(dishWithPhoto);
      
      if (response.success) {
        setShowModal(false);
        fetchDishes(); // Recargar la lista
        // Limpiar selección de imagen
        setSelectedImage(null);
        setImagePreview(null);
      } else {
        setError(response.message || 'Error al crear el plato');
      }
    } catch (error) {
      setError('Error al conectar con el servidor');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar un plato
  const handleUpdateDish = async (id: number, data: UpdateDishDto) => {
    try {
      setLoading(true);
      
      // Si hay una imagen seleccionada, subirla primero
      let photoUrl = data.photo;
      if (selectedImage) {
        photoUrl = await uploadImage(selectedImage);
      }
      
      const dataWithPhoto = { ...data, photo: photoUrl };
      const response = await updateDish(id, dataWithPhoto);
      
      if (response.success) {
        setShowModal(false);
        fetchDishes(); // Recargar la lista
        // Limpiar selección de imagen
        setSelectedImage(null);
        setImagePreview(null);
      } else {
        setError(response.message || 'Error al actualizar el plato');
      }
    } catch (error) {
      setError('Error al conectar con el servidor');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDish) return;

    if (isEditing && currentDish.id) {
      // Actualizar plato existente
      const updateData: UpdateDishDto = {
        title: currentDish.title,
        description: currentDish.description,
        photo: currentDish.photo,
        cost: currentDish.cost,
        calories: currentDish.calories,
        proteins: currentDish.proteins,
        fats: currentDish.fats,
        carbohydrates: currentDish.carbohydrates,
        isActive: currentDish.isActive
      };
      handleUpdateDish(currentDish.id, updateData);
    } else {
      // Crear nuevo plato
      const newDish: Omit<DishDto, 'id'> = {
        title: currentDish.title || '',
        description: currentDish.description || '',
        photo: currentDish.photo,
        cost: currentDish.cost || 0,
        calories: currentDish.calories || 0,
        proteins: currentDish.proteins || 0,
        fats: currentDish.fats || 0,
        carbohydrates: currentDish.carbohydrates || 0,
        isActive: currentDish.isActive !== undefined ? currentDish.isActive : true
      };
      handleCreateDish(newDish);
    }
  };

  // Manejar cambio de página
  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
  };

  // Limpiar formulario para nuevo plato
  const handleNewDish = () => {
    setCurrentDish({
      title: '',
      description: '',
      photo: '',
      cost: 0,
      calories: 0,
      proteins: 0,
      fats: 0,
      carbohydrates: 0,
      isActive: true
    });
    setIsEditing(false);
    setSelectedImage(null);
    setImagePreview(null);
    setShowModal(true);
  };

  // Cerrar modal y limpiar estado
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
    setImagePreview(null);
    // Liberar memoria de la URL de objeto si existe
    if (imagePreview && !imagePreview.startsWith('http')) {
      URL.revokeObjectURL(imagePreview);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Platos</h1>
          <button
            onClick={handleNewDish}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Nuevo Plato
          </button>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
            <button
              className="absolute top-0 bottom-0 right-0 px-4"
              onClick={() => setError(null)}
            >
              &times;
            </button>
          </div>
        )}

        {/* Modal de formulario */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Overlay de fondo */}
              <div 
                className="fixed inset-0 transition-opacity" 
                aria-hidden="true"
                onClick={handleCloseModal}
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              {/* Centrar el modal */}
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              {/* Modal */}
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {isEditing ? 'Editar Plato' : 'Nuevo Plato'}
                    </h2>
                    <button
                      onClick={handleCloseModal}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      &times;
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Título
                        </label>
                        <input
                          type="text"
                          value={currentDish?.title || ''}
                          onChange={(e) => setCurrentDish({...currentDish, title: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Costo
                        </label>
                        <input
                          type="number"
                          value={currentDish?.cost || 0}
                          onChange={(e) => setCurrentDish({...currentDish, cost: parseFloat(e.target.value)})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <textarea
                          value={currentDish?.description || ''}
                          onChange={(e) => setCurrentDish({...currentDish, description: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          rows={3}
                          required
                        />
                      </div>

                      {/* Selector de imagen con vista previa */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Foto del Plato
                        </label>
                        <div className="flex items-start space-x-4">
                          <div className="flex-1">
                            <div className="mt-1 flex items-center">
                              <input
                                type="text"
                                value={currentDish?.photo || ''}
                                onChange={(e) => setCurrentDish({...currentDish, photo: e.target.value})}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                placeholder="URL de la imagen (opcional)"
                              />
                              <span className="mx-2 text-gray-500">o</span>
                              <button
                                type="button"
                                onClick={handleSelectImage}
                                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                              >
                                Seleccionar imagen
                              </button>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              JPG, PNG o GIF. Máximo 5MB.
                            </p>
                          </div>
                          
                          {/* Vista previa de la imagen */}
                          <div className="w-24 h-24 border border-gray-300 rounded-md overflow-hidden flex items-center justify-center bg-gray-100">
                            {uploadingImage ? (
                              <div className="text-center text-sm text-gray-500">
                                <svg className="animate-spin h-5 w-5 mx-auto text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Subiendo...</span>
                              </div>
                            ) : imagePreview ? (
                              <img
                                src={imagePreview}
                                alt="Vista previa"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="text-center text-sm text-gray-500">
                                <span>Sin imagen</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estado
                        </label>
                        <select
                          value={currentDish?.isActive ? 'true' : 'false'}
                          onChange={(e) => setCurrentDish({...currentDish, isActive: e.target.value === 'true'})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="true">Activo</option>
                          <option value="false">Inactivo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Calorías
                        </label>
                        <input
                          type="number"
                          value={currentDish?.calories || 0}
                          onChange={(e) => setCurrentDish({...currentDish, calories: parseInt(e.target.value)})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Proteínas
                        </label>
                        <input
                          type="number"
                          value={currentDish?.proteins || 0}
                          onChange={(e) => setCurrentDish({...currentDish, proteins: parseInt(e.target.value)})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Grasas
                        </label>
                        <input
                          type="number"
                          value={currentDish?.fats || 0}
                          onChange={(e) => setCurrentDish({...currentDish, fats: parseInt(e.target.value)})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Carbohidratos
                        </label>
                        <input
                          type="number"
                          value={currentDish?.carbohydrates || 0}
                          onChange={(e) => setCurrentDish({...currentDish, carbohydrates: parseInt(e.target.value)})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        disabled={loading || uploadingImage}
                      >
                        {loading || uploadingImage ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de platos */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nutrición
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && offset === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Cargando platos...
                    </td>
                  </tr>
                ) : dishes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No hay platos disponibles
                    </td>
                  </tr>
                ) : (
                  dishes.map(dish => (
                    <tr key={dish.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {dish.photo ? (
                            <img src={dish.photo} alt={dish.title} className="h-10 w-10 rounded-full object-cover mr-3" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center text-gray-500">
                              🍽️
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">{dish.title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {dish.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${dish.cost.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500">
                          <span className="block">Calorías: {dish.calories}</span>
                          <span className="block">Prot: {dish.proteins}g | Carbs: {dish.carbohydrates}g | Grasas: {dish.fats}g</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${dish.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'}`}
                        >
                          {dish.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => fetchDish(dish.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleUpdateDish(dish.id, { isActive: !dish.isActive })}
                          className={`${dish.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {dish.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  offset === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(offset + limit)}
                disabled={offset + limit >= totalDishes}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  offset + limit >= totalDishes
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{dishes.length > 0 ? offset + 1 : 0}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(offset + limit, totalDishes)}
                  </span>{' '}
                  de <span className="font-medium">{totalDishes}</span> platos
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 ${
                      offset === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Anterior</span>
                    &larr;
                  </button>
                  
                  {/* Números de página */}
                  {Array.from({ length: Math.ceil(totalDishes / limit) }).map((_, idx) => {
                    const pageOffset = idx * limit;
                    const isCurrent = pageOffset === offset;
                    // Mostrar solo algunas páginas para no sobrecargar la UI
                    if (
                      idx < 3 || 
                      (idx >= Math.floor(offset / limit) - 1 && idx <= Math.floor(offset / limit) + 1) || 
                      idx >= Math.ceil(totalDishes / limit) - 3
                    ) {
                      return (
                        <button
                          key={idx}
                          onClick={() => handlePageChange(pageOffset)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            isCurrent
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    }
                    // Puntos suspensivos para indicar páginas omitidas
                    if (
                      (idx === 3 && Math.floor(offset / limit) > 4) || 
                      (idx === Math.ceil(totalDishes / limit) - 4 && Math.floor(offset / limit) < Math.ceil(totalDishes / limit) - 5)
                    ) {
                      return <span key={idx} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white">...</span>;
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(offset + limit)}
                    disabled={offset + limit >= totalDishes}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 ${
                      offset + limit >= totalDishes
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Siguiente</span>
                    &rarr;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishClient;