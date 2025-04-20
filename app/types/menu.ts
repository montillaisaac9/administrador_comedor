export interface DishSelect {
    id: number;
    title: string;
  }
  

export interface WeeklyPeriod {
    weekStart: Date;
    weekEnd: Date;
    isActive: boolean;
    mondayId: number;
    tuesdayId: number;
    wednesdayId: number;
    thursdayId: number;
    fridayId: number;
  }

  export interface MenuDto {
    id: number;
    weekStart: Date;
    weekEnd: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    mondayId: number;
    tuesdayId: number;
    wednesdayId: number;
    thursdayId: number;
    fridayId: number;
  }
  
  