export interface Career {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCareerDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCareerDto {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  offset: number;
  limit: number;
  arrayList: T[];
  total: number;
}
