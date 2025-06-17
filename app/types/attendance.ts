
export interface IUserAttendance {
  lastName: string;
  id: number;
  name: string;
  identification: string;
}

export interface IDishAttendance {
  id: number;
  title: string;
}

export interface IMenuItemAttendance {
  id: number;
  date: string;
  weekDay: string;
  dish: IDishAttendance;
}

export interface IAttendance {
  attended: any;
  attendedAt: string;
  id: number;
  createdAt: string;
  user: IUserAttendance;
  menuItem: IMenuItemAttendance;
}

export interface DishRatingStats {
  totalVotes: number;
  averageRating: number;
}
