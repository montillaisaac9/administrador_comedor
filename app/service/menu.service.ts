import api from '@/app/lib/axios';
import type { IResponse } from '@/app/types/response';
import { WeeklyPeriod, MenuDto, DishSelect } from '@/app/types/menu';

export const getDish = async (): Promise<DishSelect[]> => {
    const response = await api.get<{
      success: boolean;
      data: DishSelect[];
      error: null;
    }>('/dish/active');
  
    return response.data.data;
  };
export const createMenu = async (
    menu: WeeklyPeriod
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
    arrayList: MenuDto[];
    total: number;
  }>> => {
    const response = await api.post<
      IResponse<{
        offset: number;
        limit: number;
        arrayList: MenuDto[];
        total: number;
      }>
    >('/menu/all', params);
    console.log(response.data)
    return response.data;
  };