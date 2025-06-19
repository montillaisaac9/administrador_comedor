import api from '@/app/lib/axios';
import type { IResponse } from '@/app/types/response';
import type { CreateUserDto, UpdateUserDto, UserRole } from '@/app/types/user';
import { ISelect, IUser } from '@/app/types/auth';

interface UserListResponse {
  offset: number;
  limit: number;
  arrayList: IUser[];
  total: number;
}

/**
 * Service for handling user-related operations
 */

export const getUser = async (): Promise<ISelect[]> => {
  const response = await api.get<{
    success: boolean;
    data: ISelect[];
    error: null;
  }>('/users/active');

  return response.data.data;
};


export const userService = {
  /**
   * Get all users with pagination
   * @param params - Pagination parameters
   * @param params.offset - Number of records to skip
   * @param params.limit - Maximum number of records to return
   * @returns Paginated list of users
   */
  async getAll(params: { offset?: number; limit?: number } = {}): Promise<IResponse<UserListResponse>> {
    const { offset = 0, limit = 10 } = params;
    const response = await api.post<IResponse<UserListResponse>>('/users/all', { offset, limit });
    return response.data;
  },

  /**
   * Get a user by ID
   * @param id - The ID of the user to retrieve
   * @returns The requested user
   * @throws Will throw an error if user is not found
   */
  async getById(id: number): Promise<IResponse<IUser>> {
    if (!id) throw new Error('User ID is required');
    const response = await api.get<IResponse<IUser>>(`/users/${id}`);
    return response.data;
  },

  /**
   * Create a new user
   * @param userData - The user data to create
   * @returns The created user
   */
  async create(userData: Omit<CreateUserDto, 'id'>): Promise<IResponse<IUser>> {
    if (!userData.email || !userData.password || !userData.name) {
      throw new Error('Missing required fields');
    }
    const response = await api.post<IResponse<IUser>>('/users', userData);
    return response.data;
  },

  /**
   * Update an existing user
   * @param id - The ID of the user to update
   * @param updateData - The fields to update
   * @returns The updated user
   */
  async update(id: number, updateData: UpdateUserDto): Promise<IResponse<IUser>> {
    if (!id) throw new Error('User ID is required');
    const response = await api.patch<IResponse<IUser>>(`/users/${id}`, updateData);
    return response.data;
  },

  /**
   * Delete a user
   * @param id - The ID of the user to delete
   * @returns Empty response on success
   */
  async delete(id: number): Promise<IResponse<void>> {
    if (!id) throw new Error('User ID is required');
    const response = await api.delete<IResponse<void>>(`/users/${id}`);
    return response.data;
  },

  /**
   * Update user role
   * @param id - The ID of the user
   * @param role - The new role
   * @returns The updated user
   */
  async updateRole(id: number, role: UserRole): Promise<IResponse<IUser>> {
    if (!id) throw new Error('User ID is required');
    if (!['USER', 'ADMIN', 'EMPLOYEE'].includes(role)) {
      throw new Error('Invalid role');
    }
    return this.update(id, { role } as UpdateUserDto);
  },

  /**
   * Get active users
   * @returns List of active users
   */
  async getActive(): Promise<IResponse<IUser[]>> {
    const response = await api.get<IResponse<IUser[]>>('/users/active');
    return response.data;
  },

  /**
   * Deactivate a user
   * @param id - The ID of the user to deactivate
   * @returns The deactivated user
   */
  async deactivate(id: number): Promise<IResponse<IUser>> {
    if (!id) throw new Error('User ID is required');
    const response = await api.patch<IResponse<IUser>>(`/users/${id}/deactivate`);
    return response.data;
  },
  

  /**
   * Reactivate a user
   * @param id - The ID of the user to reactivate
   * @returns The reactivated user
   */
  async reactivate(id: number): Promise<IResponse<IUser>> {
    if (!id) throw new Error('User ID is required');
    const response = await api.patch<IResponse<IUser>>(`/users/${id}/reactivate`);
    return response.data;
  },
};
