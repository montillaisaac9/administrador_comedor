import { IResponse } from './response';

export interface IUserAttendance {
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
  id: number;
  createdAt: string;
  user: IUserAttendance;
  menuItem: IMenuItemAttendance;
}

export interface IAttendanceResponse extends IResponse<IAttendance[]> {}

export interface IAttendanceParams {
  offset?: number;
  limit?: number;
}
