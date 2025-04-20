
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