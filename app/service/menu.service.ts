import api from '@/app/lib/axios';
import type { IResponse } from '@/app/types/response';
import { ICreateMenu, IMenuDetails, DishSelect, IUpdateMenu } from '@/app/types/menu';

export const getDish = async (): Promise<DishSelect[]> => {
    const response = await api.get<{
      success: boolean;
      data: DishSelect[];
      error: null;
    }>('/dish/active');
  
    return response.data.data;
  };


export const createMenu = async (
    menu: ICreateMenu
  ): Promise<IResponse<string>> => {
    const response = await api.post<IResponse<string>>('/menu', menu);
    console.log(response.data)
    return response.data;
  };

export const getAllMenus = async (
    params?: { offset?: number; limit?: number }
  ): Promise<IResponse<{
    offset: number;
    limit: number;
    arrayList: IMenuDetails[];
    total: number;
  }>> => {
    const response = await api.post<
      IResponse<{
        offset: number;
        limit: number;
        arrayList: IMenuDetails[];
        total: number;
      }>
    >('/menu/all', params);
    console.log(response.data)
    return response.data;
  };

  export const updateMenu = async (
    id: number,
    params: IUpdateMenu
  ): Promise<IResponse<IMenuDetails>> => {
    const response = await api.patch<IResponse<IMenuDetails>>(
      `/menu/${id}`,
      params
    );
    console.log(response.data);
    return response.data;
  };

  export const DeleteMenu = async (id: number): Promise<IResponse<string>> => {
    const response = await api.delete<IResponse<string>>(`/menu/${id}`);
    return response.data;
  }
