import api from '@/app/lib/axios';
import type { IResponse } from '@/app/types/response';
import type { 
  Career, 
  CreateCareerDto, 
  UpdateCareerDto, 
} from '@/app/types/career';

export const careerService = {

  async getAll(params?: { offset?: number; limit?: number }): Promise<IResponse<{
    offset: number;
    limit: number;
    arrayList: Career[];
    total: number;
  }>> {
    const response = await api.post<IResponse<{
      offset: number;
      limit: number;
      arrayList: Career[];
      total: number;
    }>>('/carriers/all', params);
    return response.data;
  },

  async getActive(): Promise<IResponse<Career[]>> {
    const response = await api.get<IResponse<Career[]>>('/carriers/active');
    return response.data;
  },

  async getById(id: number): Promise<IResponse<Career>> {
    const response = await api.get<IResponse<Career>>(`/carriers/${id}`);
    return response.data;
  },

  async create(data: CreateCareerDto): Promise<IResponse<Career>> {
    const response = await api.post<IResponse<Career>>('/carriers', data);
    return response.data;
  },

  async update(
    id: number,
    data: UpdateCareerDto
  ): Promise<IResponse<Career>> {
    const response = await api.patch<IResponse<Career>>(`/carriers/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<IResponse<void>> {
    const response = await api.delete<IResponse<void>>(`/carriers/${id}`);
    return response.data;
  },

  async setActive(
    id: number,
    isActive: boolean
  ): Promise<IResponse<Career>> {
    return this.update(id, { isActive });
  },
};

export default careerService;
