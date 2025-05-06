// Enumeración de días de la semana
export enum WeekDay {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
}


export interface DishSelect {
    id: number;
    title: string;
  }

// Interfaz para elemento de menú (nuevo formato)
export interface IMenuItem {
  date: string;
  weekDay: WeekDay;
  dishId: number;
}

// Interfaz para crear un menú (nuevo formato)
export interface ICreateMenu {
  weekStart: string;
  weekEnd: string;
  isActive: boolean;
  menuItems: IMenuItem[];
}

// Interfaz para actualizar un menú (nuevo formato)
export interface IUpdateMenu {
  weekStart?: string;
  weekEnd?: string;
  isActive?: boolean;
  menuItems?: IMenuItem[];
}

// Interfaz para respuesta de elemento de menú
export interface IMenuItemResponse extends IMenuItem {
  id: number;
  createdAt: string;
  updatedAt: string;
}

// Interfaz para respuesta de menú completo
export interface IMenuResponse {
  id: number;
  weekStart: string;
  weekEnd: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  menuItems: IMenuItemResponse[];
}

// Interfaz para información básica del plato
export interface IDishInfo {
  id: number;
  title: string;
  description: string;
  photo: string | null;
  votesCount: number;
  calories: number;
  cost: number;
  carbohydrates: number;
  proteins: number;
  fats: number;
}

// Interfaz para detalles del elemento de menú con información completa del plato
export interface IMenuItemDetail extends IMenuItemResponse {
  dish: IDishInfo;
}

// Interfaz para detalles completos del menú
export interface IMenuDetails {
  id: number;
  weekStart: string;
  weekEnd: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  menuItems: IMenuItemDetail[];
}
