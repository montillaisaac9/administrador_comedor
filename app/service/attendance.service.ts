import api from '@/app/lib/axios';
import type { IResponse } from '@/app/types/response';
import { IAttendance } from '../types/attendance';

export const getAttendancesByMenu = async (
  menuId: number,
  params?: { 
    offset?: number; 
    limit?: number;
    search?: string;
    date?: string;
    menuItemId?: number;
  }
): Promise<IResponse<{
  offset: number;
  limit: number;
  arrayList: IAttendance[];
  total: number;
}>> => {
  const response = await api.post<IResponse<{
    offset: number;
    limit: number;
    arrayList: IAttendance[];
    total: number;
  }>>(`/attendance/menu/${menuId}`, params);
  
  console.log(response.data);
  return response.data;
};

export const getAllTotalAttendance = async (
  id: number
): Promise<IResponse<Array<IAttendance>>> => {
  const response = await api.get<IResponse<Array<IAttendance>>>(`/attendance/menu/${id}`);
  return response.data;
};