// src/app/service/dish.service.ts

import api from '@/app/lib/axios';
import type { IResponse } from '@/app/types/response';

// Define la interfaz que representa un Plato
export interface DishDto {
  id: number;
  title: string;
  description: string;
  photo?: string;
  cost: number;
  calories: number;
  proteins: number;
  fats: number;
  carbohydrates: number;
  isActive?: boolean;
}

export interface CreateDishDto {
  id: number;
  title: string;
  description: string;
  photo?: File;
  cost: number;
  calories: number;
  proteins: number;
  fats: number;
  carbohydrates: number;
  isActive?: boolean;
}

// 1. Crear Plato (POST /dish)
// Función para crear un plato utilizando multipart/form-data
export const createDish = async (
    params: Omit<CreateDishDto, 'id'>
  ): Promise<IResponse<DishDto>> => {
    const formData = new FormData();
  
    // Campos obligatorios
    formData.append('title', params.title);
    formData.append('description', params.description);
    formData.append('cost', params.cost.toString());
    formData.append('calories', params.calories.toString());
    formData.append('proteins', params.proteins.toString());
    formData.append('fats', params.fats.toString());
    formData.append('carbohydrates', params.carbohydrates.toString());
  
    // Campo opcional: photo
    if (params.photo) {
      formData.append('image', params.photo);
    }
  
    // Campo opcional: isActive
    if (params.isActive !== undefined && params.isActive !== null) {
      formData.append('isActive', params.isActive.toString());
    }
  
    const response = await api.post<IResponse<DishDto>>('/dish', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  
    return response.data;
  };

// 2. Obtener Todos los Platos (POST /dish/all)
export const getAllDishes = async (
  params?: { offset?: number; limit?: number } // Parámetros opcionales con valores por defecto en el backend
): Promise<IResponse<{
  offset: number;
  limit: number;
  arrayList: DishDto[];
  total: number;
}>> => {
  const response = await api.post<
    IResponse<{
      offset: number;
      limit: number;
      arrayList: DishDto[];
      total: number;
    }>
  >('/dish/all', params);
  return response.data;
};

// 3. Obtener Plato Específico (GET /dish/:id)
export const getDishById = async (
  id: number
): Promise<IResponse<DishDto>> => {
  const response = await api.get<IResponse<DishDto>>(`/dish/${id}`);
  return response.data;
};

// 4. Actualizar Plato (PATCH /dish/:id)
// Define el DTO para actualizar platos, con todos los campos opcionales
export interface UpdateDishDto {
  title?: string;
  description?: string;
  photo?: File;
  cost?: number;
  calories?: number;
  proteins?: number;
  fats?: number;
  carbohydrates?: number;
  isActive?: boolean;
}

export const updateDish = async (
  id: number,
  params: UpdateDishDto
): Promise<IResponse<DishDto>> => {
  const formData = new FormData();
  
  // Campos obligatorios
  if (params.title) formData.append('title', params.title);
  if (params.description) formData.append('description', params.description);
  if (params.cost) formData.append('cost', params.cost.toString());
  if (params.calories) formData.append('calories', params.calories.toString());
  if (params.proteins) formData.append('proteins', params.proteins.toString());
  if (params.fats) formData.append('fats', params.fats.toString());
  if (params.carbohydrates) formData.append('carbohydrates', params.carbohydrates.toString());

  // Campo opcional: photo
  if (params.photo) {
    formData.append('image', params.photo);
  }

  // Campo opcional: isActive
  if (params.isActive !== undefined && params.isActive !== null) {
    formData.append('isActive', params.isActive.toString());
  }

  const response = await api.patch<IResponse<DishDto>>(`/dish/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
