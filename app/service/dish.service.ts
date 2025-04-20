// src/app/service/dish.service.ts

import api from '@/app/lib/axios';
import type { IResponse } from '@/app/types/response';
import { CreateDishDto, DishDto, UpdateDishDto } from '../types/dish';

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
  console.log(response.data)
  return response.data;
};

// 3. Obtener Plato Específico (GET /dish/:id)
export const getDishById = async (
  id: number
): Promise<IResponse<DishDto>> => {
  const response = await api.get<IResponse<DishDto>>(`/dish/${id}`);
  return response.data;
};

export const updateDish = async (
  id: number,
  params: UpdateDishDto
): Promise<IResponse<DishDto>> => {
  const formData = new FormData();
  console.log(params)
  if (params.title) formData.append('title', params.title);
  if (params.description) formData.append('description', params.description);
  if (params.cost) formData.append('cost', params.cost.toString());
  if (params.calories) formData.append('calories', params.calories.toString());
  if (params.proteins) formData.append('proteins', params.proteins.toString());
  if (params.fats) formData.append('fats', params.fats.toString());
  if (params.carbohydrates) formData.append('carbohydrates', params.carbohydrates.toString());
  if (params.isActive !== undefined && params.isActive !== null) {
    formData.append('isActive', params.isActive.toString());
  }

  if (params.photo) {
    
    formData.append('image', params.photo);
  }

  const response = await api.patch<IResponse<DishDto>>(`/dish/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  console.log(response)
  return response.data;
};

export const DeleteDish = async (id: number): Promise<IResponse<string>> => {
  const response = await api.delete<IResponse<string>>(`/dish/${id}`);
  return response.data;
}